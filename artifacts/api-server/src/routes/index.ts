import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import adminRouter from "./admin";
import settingsRouter from "./settings";
import ordersRouter from "./orders";
import couponsRouter from "./coupons";
import reviewsRouter from "./reviews";
import faqRouter from "./faq";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(adminRouter);
router.use(settingsRouter);
router.use(ordersRouter);
router.use(couponsRouter);
router.use(reviewsRouter);
router.use(faqRouter);

export default router;
