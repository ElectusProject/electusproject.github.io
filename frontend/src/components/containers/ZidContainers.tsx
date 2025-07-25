import ZidXButton from "../buttons/ZidXButton";

interface ZidContainerInputs {
  width: string,
  height: string,
  zid: string,
  zidList: string[],
  setZidList: React.Dispatch<React.SetStateAction<string[]>>,
}

export default function ZidContainers({ width, height, zid, zidList, setZidList }: ZidContainerInputs) {
  return (
    <div className={`${width} ${height} border-1 border-[#F1E9E9] !rounded-4xl backdrop-blur-2xl bg-gradient-to-t from-violet-900/50 to-white/30 relative mb-2 flex flex-col justify-center`}>
      <p>{zid}</p>
      <ZidXButton id={zid} zidList={zidList} setZidList={setZidList} />
    </div>
  );
} 