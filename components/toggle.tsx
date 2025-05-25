import { SwitchOff, SwitchOn } from "iconoir-react";

interface IToggleProps {}

const Toggle: React.FC<{
    on: boolean;
    onClick: () => void;

    leftText: string;
    rightText: string;
}> = ({ on, onClick, leftText, rightText }) => {
    return (
        <div className="flex justify-end">
            <div
                className="flex flex-row items-center cursor-pointer"
                onClick={() => {
                    onClick();
                }}
            >
                <div>{leftText}</div>
                {on ? (
                    <SwitchOn className="text-5xl stroke-1 px-4" />
                ) : (
                    <SwitchOff className="text-5xl stroke-1 px-4" />
                )}
                <div>{rightText}</div>
            </div>
        </div>
    );
};

export default Toggle;
