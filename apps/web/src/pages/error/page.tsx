import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "@repo/ui/components/ui/button";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || "Unknown error";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Oops!</h1>
      <p className="text-lg text-muted-foreground">Sorry, an unexpected error has occurred.</p>
      <p className="font-mono text-sm bg-muted p-2 rounded">
        {errorMessage}
      </p>
      <Button asChild>
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  );
}

