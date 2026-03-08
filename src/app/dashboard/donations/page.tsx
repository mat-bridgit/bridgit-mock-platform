import { donations } from "@/data/donations";
import { DonationsTable } from "@/components/donations-table";

export default function DonationsPage() {
    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">Donations</h1>
            <DonationsTable data={donations} />
        </div>
    );
}
