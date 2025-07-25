import './Heading.css'

interface HeadingInputs {
  text: string
}

export default function Heading({ text }: HeadingInputs) {
  return (
    <div className='flex flex-row justify-center w-full'>
      <div className="heading">{text}</div>
    </div>
  );
}