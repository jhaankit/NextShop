import { apiFetch, toQueryString } from "@/services/http";
import type { Account, Address, CustomerLocation, ListResponse, PortalUser } from "@/types/domain";
import type { AddressInput, StoreProfileInput, UserInput } from "@/schemas/forms";

export const customersService = {
  getCustomers: (query: Record<string, string | number | undefined> = {}) => apiFetch<ListResponse<CustomerLocation>>(`/api/customers${toQueryString(query)}`),
  getCustomer: (id: string) => apiFetch<CustomerLocation>(`/api/customers/${id}`),
  getAccount: () => apiFetch<Account>("/api/account"),
  saveStoreProfile: (payload: StoreProfileInput) => apiFetch<CustomerLocation["profile"]>("/api/account/profile", { method: "PATCH", body: JSON.stringify(payload) }),
  saveAddress: (payload: AddressInput) => apiFetch<Address>("/api/account/addresses", { method: "POST", body: JSON.stringify(payload) }),
  saveUser: (payload: UserInput) => apiFetch<PortalUser>("/api/account/users", { method: "POST", body: JSON.stringify(payload) })
};
