import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminOverview, AdminUser, Alert, AuthResult, BehaviorEventInput, DemoScenarios, ErrorResponse, HealthStatus, HeatmapPoint, LoginInput, OtpInput, SessionInfo, SessionRecord, SimulateInput, SimulationResult, SuccessResponse, Transaction, TransactionInput, TransactionResult, TrustHistoryPoint, TrustScore, TrustScoreUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLoginUrl: () => string;
/**
 * @summary Login with username and password
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResult>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
* @summary Login with username and password
*/
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getVerifyOtpUrl: () => string;
/**
 * @summary Verify OTP code
 */
export declare const verifyOtp: (otpInput: OtpInput, options?: RequestInit) => Promise<SessionInfo>;
export declare const getVerifyOtpMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof verifyOtp>>, TError, {
        data: BodyType<OtpInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof verifyOtp>>, TError, {
    data: BodyType<OtpInput>;
}, TContext>;
export type VerifyOtpMutationResult = NonNullable<Awaited<ReturnType<typeof verifyOtp>>>;
export type VerifyOtpMutationBody = BodyType<OtpInput>;
export type VerifyOtpMutationError = ErrorType<ErrorResponse>;
/**
* @summary Verify OTP code
*/
export declare const useVerifyOtp: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof verifyOtp>>, TError, {
        data: BodyType<OtpInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof verifyOtp>>, TError, {
    data: BodyType<OtpInput>;
}, TContext>;
export declare const getGetSessionUrl: () => string;
/**
 * @summary Get current session info
 */
export declare const getSession: (options?: RequestInit) => Promise<SessionInfo>;
export declare const getGetSessionQueryKey: () => readonly ["/api/auth/session"];
export declare const getGetSessionQueryOptions: <TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSessionQueryResult = NonNullable<Awaited<ReturnType<typeof getSession>>>;
export type GetSessionQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current session info
 */
export declare function useGetSession<TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout current session
 */
export declare const logout: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout current session
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getRecordBehaviorEventUrl: () => string;
/**
 * @summary Record a behavioral event
 */
export declare const recordBehaviorEvent: (behaviorEventInput: BehaviorEventInput, options?: RequestInit) => Promise<TrustScoreUpdate>;
export declare const getRecordBehaviorEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordBehaviorEvent>>, TError, {
        data: BodyType<BehaviorEventInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof recordBehaviorEvent>>, TError, {
    data: BodyType<BehaviorEventInput>;
}, TContext>;
export type RecordBehaviorEventMutationResult = NonNullable<Awaited<ReturnType<typeof recordBehaviorEvent>>>;
export type RecordBehaviorEventMutationBody = BodyType<BehaviorEventInput>;
export type RecordBehaviorEventMutationError = ErrorType<unknown>;
/**
* @summary Record a behavioral event
*/
export declare const useRecordBehaviorEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordBehaviorEvent>>, TError, {
        data: BodyType<BehaviorEventInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof recordBehaviorEvent>>, TError, {
    data: BodyType<BehaviorEventInput>;
}, TContext>;
export declare const getGetTrustScoreUrl: () => string;
/**
 * @summary Get current trust score for the session
 */
export declare const getTrustScore: (options?: RequestInit) => Promise<TrustScore>;
export declare const getGetTrustScoreQueryKey: () => readonly ["/api/trust/score"];
export declare const getGetTrustScoreQueryOptions: <TData = Awaited<ReturnType<typeof getTrustScore>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrustScore>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTrustScore>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTrustScoreQueryResult = NonNullable<Awaited<ReturnType<typeof getTrustScore>>>;
export type GetTrustScoreQueryError = ErrorType<unknown>;
/**
 * @summary Get current trust score for the session
 */
export declare function useGetTrustScore<TData = Awaited<ReturnType<typeof getTrustScore>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrustScore>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTrustHistoryUrl: () => string;
/**
 * @summary Get trust score history for the session
 */
export declare const getTrustHistory: (options?: RequestInit) => Promise<TrustHistoryPoint[]>;
export declare const getGetTrustHistoryQueryKey: () => readonly ["/api/trust/history"];
export declare const getGetTrustHistoryQueryOptions: <TData = Awaited<ReturnType<typeof getTrustHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrustHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTrustHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTrustHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof getTrustHistory>>>;
export type GetTrustHistoryQueryError = ErrorType<unknown>;
/**
 * @summary Get trust score history for the session
 */
export declare function useGetTrustHistory<TData = Awaited<ReturnType<typeof getTrustHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrustHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListTransactionsUrl: () => string;
/**
 * @summary List transactions for the current user
 */
export declare const listTransactions: (options?: RequestInit) => Promise<Transaction[]>;
export declare const getListTransactionsQueryKey: () => readonly ["/api/transactions"];
export declare const getListTransactionsQueryOptions: <TData = Awaited<ReturnType<typeof listTransactions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTransactions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTransactions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTransactionsQueryResult = NonNullable<Awaited<ReturnType<typeof listTransactions>>>;
export type ListTransactionsQueryError = ErrorType<unknown>;
/**
 * @summary List transactions for the current user
 */
export declare function useListTransactions<TData = Awaited<ReturnType<typeof listTransactions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTransactions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTransactionUrl: () => string;
/**
 * @summary Create a new transaction
 */
export declare const createTransaction: (transactionInput: TransactionInput, options?: RequestInit) => Promise<TransactionResult>;
export declare const getCreateTransactionMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTransaction>>, TError, {
        data: BodyType<TransactionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTransaction>>, TError, {
    data: BodyType<TransactionInput>;
}, TContext>;
export type CreateTransactionMutationResult = NonNullable<Awaited<ReturnType<typeof createTransaction>>>;
export type CreateTransactionMutationBody = BodyType<TransactionInput>;
export type CreateTransactionMutationError = ErrorType<ErrorResponse>;
/**
* @summary Create a new transaction
*/
export declare const useCreateTransaction: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTransaction>>, TError, {
        data: BodyType<TransactionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTransaction>>, TError, {
    data: BodyType<TransactionInput>;
}, TContext>;
export declare const getGetAdminOverviewUrl: () => string;
/**
 * @summary Get admin dashboard overview stats
 */
export declare const getAdminOverview: (options?: RequestInit) => Promise<AdminOverview>;
export declare const getGetAdminOverviewQueryKey: () => readonly ["/api/admin/overview"];
export declare const getGetAdminOverviewQueryOptions: <TData = Awaited<ReturnType<typeof getAdminOverview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminOverview>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminOverviewQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminOverview>>>;
export type GetAdminOverviewQueryError = ErrorType<unknown>;
/**
 * @summary Get admin dashboard overview stats
 */
export declare function useGetAdminOverview<TData = Awaited<ReturnType<typeof getAdminOverview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListAdminUsersUrl: () => string;
/**
 * @summary List all users with risk scores
 */
export declare const listAdminUsers: (options?: RequestInit) => Promise<AdminUser[]>;
export declare const getListAdminUsersQueryKey: () => readonly ["/api/admin/users"];
export declare const getListAdminUsersQueryOptions: <TData = Awaited<ReturnType<typeof listAdminUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminUsers>>>;
export type ListAdminUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users with risk scores
 */
export declare function useListAdminUsers<TData = Awaited<ReturnType<typeof listAdminUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListAlertsUrl: () => string;
/**
 * @summary List fraud alerts
 */
export declare const listAlerts: (options?: RequestInit) => Promise<Alert[]>;
export declare const getListAlertsQueryKey: () => readonly ["/api/admin/alerts"];
export declare const getListAlertsQueryOptions: <TData = Awaited<ReturnType<typeof listAlerts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAlerts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAlertsQueryResult = NonNullable<Awaited<ReturnType<typeof listAlerts>>>;
export type ListAlertsQueryError = ErrorType<unknown>;
/**
 * @summary List fraud alerts
 */
export declare function useListAlerts<TData = Awaited<ReturnType<typeof listAlerts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListSessionsUrl: () => string;
/**
 * @summary List active and suspicious sessions
 */
export declare const listSessions: (options?: RequestInit) => Promise<SessionRecord[]>;
export declare const getListSessionsQueryKey: () => readonly ["/api/admin/sessions"];
export declare const getListSessionsQueryOptions: <TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSessionsQueryResult = NonNullable<Awaited<ReturnType<typeof listSessions>>>;
export type ListSessionsQueryError = ErrorType<unknown>;
/**
 * @summary List active and suspicious sessions
 */
export declare function useListSessions<TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetFraudHeatmapUrl: () => string;
/**
 * @summary Get fraud attempt heatmap data
 */
export declare const getFraudHeatmap: (options?: RequestInit) => Promise<HeatmapPoint[]>;
export declare const getGetFraudHeatmapQueryKey: () => readonly ["/api/admin/heatmap"];
export declare const getGetFraudHeatmapQueryOptions: <TData = Awaited<ReturnType<typeof getFraudHeatmap>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFraudHeatmap>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFraudHeatmap>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFraudHeatmapQueryResult = NonNullable<Awaited<ReturnType<typeof getFraudHeatmap>>>;
export type GetFraudHeatmapQueryError = ErrorType<unknown>;
/**
 * @summary Get fraud attempt heatmap data
 */
export declare function useGetFraudHeatmap<TData = Awaited<ReturnType<typeof getFraudHeatmap>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFraudHeatmap>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDemoScenariosUrl: () => string;
/**
 * @summary Get demo fraud scenarios comparison data
 */
export declare const getDemoScenarios: (options?: RequestInit) => Promise<DemoScenarios>;
export declare const getGetDemoScenariosQueryKey: () => readonly ["/api/demo/scenarios"];
export declare const getGetDemoScenariosQueryOptions: <TData = Awaited<ReturnType<typeof getDemoScenarios>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDemoScenarios>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDemoScenarios>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDemoScenariosQueryResult = NonNullable<Awaited<ReturnType<typeof getDemoScenarios>>>;
export type GetDemoScenariosQueryError = ErrorType<unknown>;
/**
 * @summary Get demo fraud scenarios comparison data
 */
export declare function useGetDemoScenarios<TData = Awaited<ReturnType<typeof getDemoScenarios>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDemoScenarios>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSimulateScenarioUrl: () => string;
/**
 * @summary Simulate a fraud scenario
 */
export declare const simulateScenario: (simulateInput: SimulateInput, options?: RequestInit) => Promise<SimulationResult>;
export declare const getSimulateScenarioMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof simulateScenario>>, TError, {
        data: BodyType<SimulateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof simulateScenario>>, TError, {
    data: BodyType<SimulateInput>;
}, TContext>;
export type SimulateScenarioMutationResult = NonNullable<Awaited<ReturnType<typeof simulateScenario>>>;
export type SimulateScenarioMutationBody = BodyType<SimulateInput>;
export type SimulateScenarioMutationError = ErrorType<unknown>;
/**
* @summary Simulate a fraud scenario
*/
export declare const useSimulateScenario: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof simulateScenario>>, TError, {
        data: BodyType<SimulateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof simulateScenario>>, TError, {
    data: BodyType<SimulateInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map