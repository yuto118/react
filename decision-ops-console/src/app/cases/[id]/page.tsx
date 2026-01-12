import { CaseDetailPage } from "@/components/cases/case-detail-page";

export default function Page(props: { params: { id: string } }) {
  const { id } = props.params;
  return <CaseDetailPage caseId={id} />;
}

