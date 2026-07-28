import { useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { 
  useGetAdminMe, 
  useGetProduct,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminListCategories,
  getAdminListCategoriesQueryKey,
  getGetProductQueryKey,
  getAdminListProductsQueryKey,
  getGetStoreStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  originalPrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock must be >= 0"),
  badge: z.string().optional().nullable(),
  imageUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  buyLink: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminProductForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/golustore-control/products/:id/edit");
  
  const isEdit = !!params?.id;
  const id = isEdit ? parseInt(params.id!) : 0;

  const { data: session, isLoading: sessionLoading } = useGetAdminMe();
  const { data: product, isLoading: productLoading } = useGetProduct(id, {
    query: { enabled: isEdit && !!id, queryKey: getGetProductQueryKey(id) }
  });
  
  const { data: categories } = useAdminListCategories({
    query: { enabled: !!session?.authenticated, queryKey: getAdminListCategoriesQueryKey() }
  });

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      setLocation("/golustore-control");
    }
  }, [session, sessionLoading, setLocation]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "gaming",
      subcategory: "",
      price: 0,
      originalPrice: null,
      stock: 1,
      badge: "",
      imageUrl: "",
      buyLink: "",
      isActive: true,
    }
  });

  useEffect(() => {
    if (isEdit && product) {
      form.reset({
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory || "",
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        badge: product.badge || "",
        imageUrl: product.imageUrl || "",
        buyLink: product.buyLink || "",
        isActive: product.isActive,
      });
    }
  }, [isEdit, product, form]);

  const createMutation = useAdminCreateProduct({
    mutation: {
      onSuccess: () => {
        toast({ title: "Success", description: "Product created successfully." });
        queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
        setLocation("/golustore-control/dashboard");
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Error", description: "Failed to create product." });
      }
    }
  });

  const updateMutation = useAdminUpdateProduct({
    mutation: {
      onSuccess: () => {
        toast({ title: "Success", description: "Product updated successfully." });
        queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(id) });
        setLocation("/golustore-control/dashboard");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to update product." });
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    // Clean up empty strings to null for optional fields
    const payload = {
      ...data,
      subcategory: data.subcategory || undefined,
      originalPrice: data.originalPrice || undefined,
      badge: data.badge || undefined,
      imageUrl: data.imageUrl || undefined,
      buyLink: data.buyLink || undefined,
    };

    if (isEdit) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (sessionLoading || (isEdit && productLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/golustore-control/dashboard" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
          {isEdit ? "Edit Product" : "New Product"}
        </h1>
        <p className="text-muted-foreground font-mono text-sm">
          {isEdit ? `Updating product #${id}` : "Add a new digital asset to the store"}
        </p>
      </div>

      <div className="bg-card border border-white/5 rounded-2xl p-6 md:p-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase tracking-wider text-xs">Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Valorant Immortal Account" className="font-bold" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase tracking-wider text-xs">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.slug}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase tracking-wider text-xs">Subcategory</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Netflix, PUBG" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase tracking-wider text-xs">Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase tracking-wider text-xs">Original Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Optional" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase tracking-wider text-xs">Stock</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="badge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase tracking-wider text-xs">Badge Label</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. HOT, NEW, SALE" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="h-full flex flex-col">
                      <FormLabel className="font-mono uppercase tracking-wider text-xs">Description</FormLabel>
                      <FormControl className="flex-1">
                        <Textarea 
                          placeholder="Detailed product description..." 
                          className="min-h-[150px] resize-y" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase tracking-wider text-xs flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" /> Image URL
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buyLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase tracking-wider text-xs">External Buy Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 bg-background p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-bold uppercase tracking-wider">Active Status</FormLabel>
                        <div className="text-xs text-muted-foreground font-mono">Visible in store</div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,255,204,0.2)] hover:shadow-[0_0_25px_rgba(0,255,204,0.4)] disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isEdit ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
