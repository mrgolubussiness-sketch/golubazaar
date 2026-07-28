import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetAdminMe,
  useAdminGetSettings,
  useAdminUpdateSettings,
  useAdminListCategories,
  useAdminCreateCategory,
  useAdminUpdateCategory,
  useAdminDeleteCategory,
  useAdminListProducts,
  useAdminUpdateProduct,
  getAdminGetSettingsQueryKey,
  getAdminListCategoriesQueryKey,
  getAdminListProductsQueryKey,
  getGetStoreSettingsQueryKey
} from "@workspace/api-client-react";
import { ArrowLeft, Save, Loader2, Plus, Edit2, Trash2, Check, X, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store Name is required"),
  tagline: z.string().optional().nullable(),
  logoUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  discordLink: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  whatsappNumber: z.string().optional().nullable(),
  contactEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  announcementText: z.string().optional().nullable(),
  announcementActive: z.boolean().default(false),
  aboutText: z.string().optional().nullable(),
  discordUsername: z.string().optional().nullable(),
  discordSupportServer: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  discordShopLink: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  telegramLink: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  instagramLink: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  youtubeLink: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  discordWebhookUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

const categorySchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  label: z.string().min(1, "Label is required"),
  icon: z.string().min(1, "Icon name is required"),
  color: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session, isLoading: sessionLoading } = useGetAdminMe();
  
  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      setLocation("/golustore-control");
    }
  }, [session, sessionLoading, setLocation]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Link href="/golustore-control/dashboard" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Store Settings</h1>
          <p className="text-muted-foreground font-mono text-sm">System configuration and metadata</p>
        </div>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 bg-card border border-white/5 h-auto p-1 gap-1">
          <TabsTrigger value="identity" className="py-3 font-bold uppercase tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Store Identity
          </TabsTrigger>
          <TabsTrigger value="categories" className="py-3 font-bold uppercase tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Categories
          </TabsTrigger>
          <TabsTrigger value="quick-edit" className="py-3 font-bold uppercase tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Quick Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identity">
          <StoreIdentityTab />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="quick-edit">
          <QuickEditorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StoreIdentityTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useAdminGetSettings();
  
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: "",
      tagline: "",
      logoUrl: "",
      discordLink: "",
      whatsappNumber: "",
      contactEmail: "",
      announcementText: "",
      announcementActive: false,
      aboutText: "",
      discordUsername: "",
      discordSupportServer: "",
      discordShopLink: "",
      telegramLink: "",
      instagramLink: "",
      youtubeLink: "",
      discordWebhookUrl: "",
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        storeName: settings.storeName,
        tagline: settings.tagline || "",
        logoUrl: settings.logoUrl || "",
        discordLink: settings.discordLink || "",
        whatsappNumber: settings.whatsappNumber || "",
        contactEmail: settings.contactEmail || "",
        announcementText: settings.announcementText || "",
        announcementActive: settings.announcementActive || false,
        aboutText: settings.aboutText || "",
        discordUsername: settings.discordUsername || "",
        discordSupportServer: settings.discordSupportServer || "",
        discordShopLink: settings.discordShopLink || "",
        telegramLink: settings.telegramLink || "",
        instagramLink: settings.instagramLink || "",
        youtubeLink: settings.youtubeLink || "",
        discordWebhookUrl: settings.discordWebhookUrl || "",
      });
    }
  }, [settings, form]);

  const updateMutation = useAdminUpdateSettings({
    mutation: {
      onSuccess: () => {
        toast({ title: "Settings saved", description: "Store identity updated successfully." });
        queryClient.invalidateQueries({ queryKey: getAdminGetSettingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStoreSettingsQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to update settings." });
      }
    }
  });

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    updateMutation.mutate({ 
      data: {
        ...data,
        tagline: data.tagline || null,
        logoUrl: data.logoUrl || null,
        discordLink: data.discordLink || null,
        whatsappNumber: data.whatsappNumber || null,
        contactEmail: data.contactEmail || null,
        announcementText: data.announcementText || null,
        aboutText: data.aboutText || null,
        discordUsername: data.discordUsername || null,
        discordSupportServer: data.discordSupportServer || null,
        discordShopLink: data.discordShopLink || null,
        telegramLink: data.telegramLink || null,
        instagramLink: data.instagramLink || null,
        youtubeLink: data.youtubeLink || null,
        discordWebhookUrl: data.discordWebhookUrl || null,
      } as any
    });
  };

  const logoPreview = form.watch("logoUrl");
  const namePreview = form.watch("storeName");

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6 md:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="storeName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase tracking-wider text-xs">Store Name</FormLabel>
                    <FormControl><Input {...field} className="font-bold" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tagline" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase tracking-wider text-xs">Tagline</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono uppercase tracking-wider text-xs">Logo URL</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="https://" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="discordLink" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase tracking-wider text-xs">Discord Link</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="https://discord.gg/..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase tracking-wider text-xs">WhatsApp Number</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="+1..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase tracking-wider text-xs">Contact Email</FormLabel>
                    <FormControl><Input type="email" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <FormField control={form.control} name="announcementActive" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 bg-background p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-bold uppercase tracking-wider">Announcement Bar</FormLabel>
                      <div className="text-xs text-muted-foreground font-mono">Show banner at the top of the store</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="announcementText" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase tracking-wider text-xs">Announcement Text</FormLabel>
                    <FormControl><Textarea {...field} value={field.value || ""} placeholder="SALE IS LIVE!" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-6 pt-8 border-t border-white/5">
                <h3 className="text-lg font-bold uppercase tracking-widest text-secondary">About & Social Links</h3>
                
                <FormField control={form.control} name="aboutText" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase tracking-wider text-xs">About Text</FormLabel>
                    <FormControl><Textarea {...field} value={field.value || ""} placeholder="Tell your customers who you are..." className="min-h-[100px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="discordUsername" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase tracking-wider text-xs">Discord Username</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="your_username#0000 or @handle" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="discordSupportServer" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase tracking-wider text-xs">Support Server Link</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="https://discord.gg/..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="discordShopLink" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase tracking-wider text-xs">Discord Shop Link</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="https://discord.com/channels/..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="telegramLink" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase tracking-wider text-xs">Telegram Link</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="https://t.me/..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="instagramLink" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase tracking-wider text-xs">Instagram Link</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="https://instagram.com/..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="youtubeLink" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase tracking-wider text-xs">YouTube Link</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="https://youtube.com/..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-white/5">
                <h3 className="text-lg font-bold uppercase tracking-widest text-secondary">Order Notifications</h3>
                <FormField control={form.control} name="discordWebhookUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase tracking-wider text-xs">Discord Webhook URL</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="https://discord.com/api/webhooks/..." /></FormControl>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      When set, a message is posted to this Discord channel every time a customer places an order. Get it from your Discord channel → Integrations → Webhooks.
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-xl border border-white/10 bg-background/50 p-6 flex flex-col items-center text-center space-y-4 sticky top-24">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Live Preview</div>
                <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="text-3xl font-black text-primary">{namePreview?.[0] || "G"}</div>
                  )}
                </div>
                <h3 className="text-xl font-bold">{namePreview || "Store Name"}</h3>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-white/5">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-8 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,204,0.2)]"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function CategoriesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useAdminListCategories();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      slug: "",
      label: "",
      icon: "box",
      color: "",
      description: "",
      sortOrder: 0,
      isActive: true,
    }
  });

  const createMutation = useAdminCreateCategory({
    mutation: {
      onSuccess: () => {
        toast({ title: "Category Created" });
        queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
        setIsDialogOpen(false);
        form.reset();
      }
    }
  });

  const updateMutation = useAdminUpdateCategory({
    mutation: {
      onSuccess: () => {
        toast({ title: "Category Updated" });
        queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
        setIsDialogOpen(false);
        setEditingId(null);
      }
    }
  });

  const deleteMutation = useAdminDeleteCategory({
    mutation: {
      onSuccess: () => {
        toast({ title: "Category Deleted" });
        queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
      }
    }
  });

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    form.reset({
      slug: cat.slug,
      label: cat.label,
      icon: cat.icon,
      color: cat.color || "",
      description: cat.description || "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    form.reset({
      slug: "",
      label: "",
      icon: "box",
      color: "",
      description: "",
      sortOrder: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: z.infer<typeof categorySchema>) => {
    const payload = {
      ...data,
      color: data.color || undefined,
      description: data.description || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-widest">Categories</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button onClick={openNew} className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wider text-xs rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "New Category"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="label" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-mono">Label</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-mono">Slug</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="icon" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-mono">Icon (Lucide)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="color" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-mono">Color (Hex/Tailwind)</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-mono">Description</FormLabel>
                    <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sortOrder" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-mono">Sort Order</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-col justify-center pt-6">
                      <div className="flex items-center gap-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <span className="text-sm font-bold uppercase tracking-wider">Active</span>
                      </div>
                    </FormItem>
                  )} />
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-2 bg-primary text-primary-foreground font-bold uppercase rounded-lg">
                    {editingId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-mono uppercase tracking-wider text-muted-foreground bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Sort</th>
              <th className="px-6 py-4">Label</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : categories?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground font-mono">No categories found.</td></tr>
            ) : (
              categories?.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-mono">{cat.sortOrder}</td>
                  <td className="px-6 py-4 font-bold flex items-center gap-2">
                    {cat.label}
                  </td>
                  <td className="px-6 py-4 font-mono text-muted-foreground">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded border", cat.isActive ? "border-primary/50 text-primary bg-primary/10" : "border-white/10 text-muted-foreground bg-white/5")}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(cat)} className="p-2 hover:text-secondary transition-colors inline-block mr-2"><Edit2 className="w-4 h-4" /></button>
                    <button 
                      onClick={() => { if(confirm("Delete category?")) deleteMutation.mutate({ id: cat.id }) }}
                      className="p-2 hover:text-destructive transition-colors inline-block"
                    ><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickEditorTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useAdminListProducts();
  
  const updateMutation = useAdminUpdateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
      }
    }
  });

  const handleUpdate = (id: number, field: string, value: any) => {
    updateMutation.mutate({ id, data: { [field]: value } }, {
      onSuccess: () => {
        // Visual feedback handled by row component or general toast
        toast({ title: "Saved", description: "Product updated.", duration: 2000 });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to update product." });
      }
    });
  };

  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-lg font-bold uppercase tracking-widest">Quick Editor</h2>
        <p className="text-xs font-mono text-muted-foreground mt-1">Click cells to edit. Changes save automatically.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs font-mono uppercase tracking-wider text-muted-foreground bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3 w-32">Price (₹)</th>
              <th className="px-4 py-3 w-32">Orig Price</th>
              <th className="px-4 py-3 w-24">Stock</th>
              <th className="px-4 py-3 w-40">Badge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : products?.map((product) => (
              <tr key={product.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-2">
                  <Switch 
                    checked={product.isActive} 
                    onCheckedChange={(val) => handleUpdate(product.id, "isActive", val)}
                  />
                </td>
                <td className="px-4 py-2 font-bold max-w-[200px] truncate" title={product.name}>
                  {product.name}
                </td>
                <td className="px-4 py-2">
                  <InlineEditable 
                    value={product.price.toString()} 
                    type="number"
                    onSave={(val) => handleUpdate(product.id, "price", parseFloat(val))} 
                  />
                </td>
                <td className="px-4 py-2">
                  <InlineEditable 
                    value={product.originalPrice?.toString() || ""} 
                    type="number"
                    onSave={(val) => handleUpdate(product.id, "originalPrice", val ? parseFloat(val) : null)} 
                  />
                </td>
                <td className="px-4 py-2">
                  <InlineEditable 
                    value={product.stock.toString()} 
                    type="number"
                    onSave={(val) => handleUpdate(product.id, "stock", parseInt(val, 10))} 
                  />
                </td>
                <td className="px-4 py-2">
                  <Select 
                    value={product.badge || "none"} 
                    onValueChange={(val) => handleUpdate(product.id, "badge", val === "none" ? null : val)}
                  >
                    <SelectTrigger className="h-8 text-xs font-mono">
                      <SelectValue placeholder="Badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="HOT">HOT</SelectItem>
                      <SelectItem value="NEW">NEW</SelectItem>
                      <SelectItem value="SALE">SALE</SelectItem>
                      <SelectItem value="LIMITED">LIMITED</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InlineEditable({ value, onSave, type = "text" }: { value: string, onSave: (val: string) => void, type?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-8 px-2 py-1 text-sm font-mono bg-background"
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="h-8 px-2 py-1 flex items-center border border-transparent hover:border-white/20 hover:bg-white/5 rounded cursor-pointer text-sm font-mono transition-colors"
    >
      {value || <span className="text-muted-foreground opacity-50">-</span>}
    </div>
  );
}