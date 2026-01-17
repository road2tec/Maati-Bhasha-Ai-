export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-card/50">
      <div className="container mx-auto flex h-14 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Bhashantar Bharati. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
