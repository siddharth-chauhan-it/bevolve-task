import CandidateForm from "../components/CandidateForm";
import candidateForm from "../constants/candidateForm.json";

export default function Home() {
  return (
    <div>
      <div>
        <CandidateForm formData={candidateForm} />
      </div>
    </div>
  );
}
