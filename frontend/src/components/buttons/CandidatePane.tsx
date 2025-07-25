import './CandidatePane.css'

interface CandidatePaneInputs {
	order?: number,
	text?: string,
	margin?: string,
	children?: React.ReactNode
}

export default function CandidatePane({ order, text, margin, children }: CandidatePaneInputs) {
	return (
		<div className={`flex justify-around ${margin}`}>
			<div className="candidate-pane">
				<div className="ml-7 min-w-5 max-h-full overflow-y-auto text-left">{order}</div>
				<div className="ml-2 max-h-full overflow-y-auto text-left">{text}</div>
				<div className="buttons">
					{children}
				</div>
			</div>
		</div>
	);
}