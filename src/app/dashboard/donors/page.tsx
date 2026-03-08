import { donors } from "@/data/donors";
import { DonorsTable } from "@/components/donors-table";

export default function DonorsPage() {
    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">Donors</h1>
            <DonorsTable data={donors} />
        </div>
    );
}
