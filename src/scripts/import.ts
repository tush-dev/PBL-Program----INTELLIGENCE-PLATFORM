import { importAll } from "@/lib/import";

importAll()
  .then(() => {
    console.log("Import completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  });
