import React, { useState } from "react";
import { ModelSchema , Feature } from "@repo/types";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent , DropdownMenuTrigger , DropdownMenuItem } from "./ui/dropdown-menu";
import { Clapperboard, Globe, Image, Info, Sparkles } from "lucide-react";

interface ModelSelectionProps {
    modelList : ModelSchema[],
    selectedModel : ModelSchema,
    setSelectedModel : (model : ModelSchema) => void
}

const ModelSelectionModal = ({
    modelList,
    selectedModel,
    setSelectedModel
} : ModelSelectionProps) => {
    const [currentModel , setCurrentModel] = useState<ModelSchema>(selectedModel);

    const handleModelChange = (index : number) => {
        if(modelList[index]){
            setCurrentModel(modelList[index]);
            setSelectedModel(modelList[index]);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit">
                <Button className="px-5 py-0.5 text-sm cursor-pointer">
                    {currentModel.modelName}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="border border-border rounded-md w-full overflow-visible">
                <div className="flex flex-col gap-0.5">
                    {
                        (modelList.length > 0) && modelList.map((model , index) => (
                            <DropdownMenuItem
                                key={index} 
                                className={`w-full max-w-lg overflow-visible ${currentModel.modelId === model.modelId ? 'bg-muted' : ''}`}
                                onClick={() => handleModelChange(index)}
                            >
                                <ModelPreviewItem model={model}/>
                            </DropdownMenuItem>
                        ))
                    }
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const ModelPreviewItem = ({ model  } : { model : ModelSchema  }) => {
    return (
        <div className={` w-full max-w-xl h-fit flex items-center justify-between p-2 gap-16 cursor-pointer rounded-md `} >
            <div className="flex items-center gap-1 ">
                <span className="text-md text-primary">{ model.modelName }</span>
                {/* Make the Info icon the group */}
                <div className="relative group">
                    <Info className="text-muted-foreground w-1 h-1" />
                    {/* Description appears on hover */}
                    <div className="absolute z-10 overflow-visible -top-10 -left-15 transition-all ease-in-out duration-200 hidden group-hover:block">
                        <div className="rounded-md px-2 py-2 border border-border text-xs bg-secondary text-primary whitespace-nowrap">
                            {model.modelDescription}
                        </div>
                    </div>
                </div>            
        </div>

            <div className="flex items-center justify-end gap-2">
                {
                    model.features.map((feature , index) => {
                        switch(feature.featureName){
                            case Feature.Reasoning : return <Sparkles key={index} className="w-6 text-primary h-6"/>
                            case Feature.Image : return <Image key={index} className="w-6 text-primary h-6"/>
                            case Feature.Search : return <Globe key={index} className="w-6 text-primary h-6"/>
                            case Feature.Video : return <Clapperboard key={index} className="w-6 text-primary h-6"/>
                            default : return null;
                        }
                    })
                }
            </div>
        </div>
    )
}

export default ModelSelectionModal;