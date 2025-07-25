import './MainButton.css'
//@ts-expect-error
import CheckSquareIcon from '../../assets/svg/check_square.svg?react'
//@ts-expect-error
import PlusIcon from '../../assets/svg/icon_plus.svg?react'
import { useNavigate } from 'react-router';

interface MainButtonProps {
    action: "Create Vote" | "Join Vote"
}

export default function MainButton(props: MainButtonProps) {

    const navigate = useNavigate();
    // Select the relavent Icon
    let Icon = CheckSquareIcon;
    if (props.action == 'Create Vote') Icon = PlusIcon;

    function button_click() {
        if (props.action == "Join Vote") {
            navigate("/voter/login")
        } else {
            navigate("/creator/login")
        }
    }

    return (
        <div className='main-button w-[400px] h-[400px]' onClick={button_click}>
            <div style={{ scale: 0.8 }}>
                <Icon />
            </div>

            <b className='button-text'>{props.action}</b>
        </div>
    )
}
