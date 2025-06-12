import { ChevronUp } from 'lucide-react';
import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ReasoningMessageProps {
    reasoning?: string | null;
    className?: string;
    showReasoning?: boolean;
    onToggle?: () => void;
}


const ReasoningMessage = ({
    reasoning,
    className,
    showReasoning = false,
    onToggle = () => { }
} : ReasoningMessageProps) => {
    // If reasoning is not provided or is empty, return null
    if(!reasoning || reasoning === null || reasoning.trim() === '') {
        return null;
    }

    return (
        <div className={`w-full flex flex-col items-start justify-start ${className} ${showReasoning ? 'pb-4' : 'pb-2'}`}>
            <button onClick={onToggle} className='w-fit py-2 bg-transparent flex items-center hover:bg-secondary transition-colors duration-300 ease-in-out cursor-pointer'>
                <span className='text-base text-primary'>Thinking</span>
                {
                    showReasoning ? ( <ChevronUp className='w-5 h-5'/> ) : <ChevronUp className='rotate-90 w-5 h-5' />
                }
            </button>
            {
                <div className={`w-full pl-4 text-primary/80 border-l ${showReasoning ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
                    <MarkdownRenderer content={reasoning} className='font-light text-sm' />
                </div>
            }
        </div>
    );
}

export default ReasoningMessage;