import { GridSkeleton } from "@/components/ui/States";

/** Default route-transition skeleton for the app shell. */
export default function AppLoading() {
  return (
    <div className="space-y-6">
      <div className="shimmer h-10 w-56 rounded-lg" />
      <div className="shimmer h-32 w-full rounded-3xl" />
      <GridSkeleton count={6} />
    </div>
  );
}
