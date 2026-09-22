"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SettingsClient() {
  const [saved, setSaved] = useState(false);
  return <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><label className="grid gap-1 text-sm font-medium">Display name<Input defaultValue="Jordan Lee" /></label><label className="grid gap-1 text-sm font-medium">Email notifications<Select defaultValue="important"><option value="all">All portal updates</option><option value="important">Important only</option><option value="none">None</option></Select></label><label className="grid gap-1 text-sm font-medium">Default landing page<Select defaultValue="/dashboard"><option value="/dashboard">Dashboard</option><option value="/orders">Orders</option><option value="/documents">Documents</option></Select></label>{saved ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800" role="status">Preferences saved for this demo session.</p> : null}<Button>Save preferences</Button></form></Card><Card><CardHeader><CardTitle>Security readiness</CardTitle></CardHeader><p className="text-sm text-slate-600">The authentication layer is provider-neutral and ready for OAuth 2.0, OIDC, SAML SSO, Okta, Auth0, or Microsoft Entra ID adapters.</p><ul className="mt-4 space-y-2 text-sm text-slate-700"><li>Mutating requests include CSRF protection.</li><li>Role checks are enforced by pages and APIs.</li><li>Password reset is simulated and never sends real email.</li></ul></Card></div>;
}
