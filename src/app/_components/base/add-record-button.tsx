export default function AddRecordButton({
  createRecord,
}: {
  createRecord: () => void;
}) {
  return (
    <div
      className="h-full w-full cursor-pointer px-4 py-1 transition duration-150 hover:bg-neutral-200"
      role="button"
      onClick={() => createRecord()}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    </div>
  );
}
