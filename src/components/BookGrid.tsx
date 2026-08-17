import BookCard, { BookCardProps } from "./BookCard";

interface BookGridProps {
  books: BookCardProps[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function BookGrid({
  books,
  isLoading = false,
  emptyMessage = "No books found matching your criteria.",
}: BookGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#FFFDF8] border border-[#DED6C8] rounded-xl aspect-[3/4] animate-pulse p-4 flex flex-col justify-end"
          >
            <div className="h-4 bg-[#F1ECE2] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[#F1ECE2] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="py-16 text-center bg-[#FFFDF8] rounded-2xl border border-[#DED6C8] px-6 shadow-xs">
        <p className="text-[#6F6A61] font-serif-luxury text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {books.map((book) => (
        <BookCard key={book.id} {...book} />
      ))}
    </div>
  );
}

