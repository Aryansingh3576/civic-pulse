// app/report/page.tsx — Report issue page
// Follows: Web Design Guidelines (heading hierarchy, semantic HTML)
import { Container } from "@/components/ui/grid";
import ComplaintForm from "@/components/complaint-form";

export const metadata = {
    title: "Report an Issue — CivicPulse",
    description: "Submit a civic issue report with photo, voice, or text.",
};

export default function ReportPage() {
    return (
        <section className="py-12 sm:py-20" aria-labelledby="report-heading">
            <Container size="md">
                <div className="text-center mb-8 sm:mb-12">
                    <h1
                        id="report-heading"
                        className="text-3xl sm:text-4xl font-bold mb-3 text-pretty"
                    >
                        Report an Issue
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Describe the problem, add a photo, and we'll route it to the right
                        department automatically.
                    </p>
                </div>
                <ComplaintForm />
            </Container>
        </section>
    );
}
