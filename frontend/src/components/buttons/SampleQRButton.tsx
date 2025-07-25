import qr from "../../assets/svg/qr_sample_code.svg"

export default function SampleQRButton() {
  return (
    <button className="flex justify-center items-center hover:cursor-pointer h-12 w-12 border-1 border-[#F1E9E9] !rounded-4xl backdrop-blur-2xl bg-gradient-to-br from-violet-950/70 to-white/10 hover:opacity-50">
      <img src={qr} alt="button-qr-code-sample" width="25" />
    </button>
  );
}