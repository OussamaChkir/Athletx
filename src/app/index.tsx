// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Redirect } from "expo-router";
export default function Root() {
  return <Redirect href={"/splash" as any} />;
}

