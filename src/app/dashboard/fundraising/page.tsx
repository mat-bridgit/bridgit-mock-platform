import { campaigns } from "@/data/fundraising";
import { FundraisingTable } from "@/components/fundraising-table";

export default function FundraisingPage() {
    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">Fundraising Campaigns</h1>
            <FundraisingTable data={campaigns} />
        </div>
    );
}
