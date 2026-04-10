import { auth } from "../auth";
import Nav from "./nav";

export default async function NavServer() {
  const session = await auth();
  return <Nav session={session} />;
}
