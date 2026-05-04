import { redirect } from "next/navigation";

type SearchParams = Promise<{ callbackUrl?: string }>;

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams({ mode: "signup" });
  if (params.callbackUrl) qs.set("callbackUrl", params.callbackUrl);
  redirect(`/auth/signin?${qs.toString()}`);
}
