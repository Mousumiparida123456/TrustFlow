import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import behaviorRouter from "./behavior";
import trustRouter from "./trust";
import transactionsRouter from "./transactions";
import adminRouter from "./admin";
import demoRouter from "./demo";
import alertsRouter from "./alerts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(behaviorRouter);
router.use(trustRouter);
router.use(transactionsRouter);
router.use(adminRouter);
router.use(demoRouter);
router.use(alertsRouter);

export default router;
