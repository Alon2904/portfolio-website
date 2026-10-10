import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 py-24">
      <h1 className="text-[2rem]">There is nothing at this address.</h1>
      <p className="mt-4">
        <Link href="/">Back to the home page</Link>
      </p>
    </div>
  );
}
