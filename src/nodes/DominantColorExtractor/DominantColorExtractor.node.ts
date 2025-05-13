import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
} from 'n8n-workflow';
import { getPixels } from 'get-pixels';
import { NdArray } from 'ndarray';
import quantize from 'quantize';

async function getPixelsFromSource(imageSource: string): Promise<NdArray<Uint8Array>> {
    return await getPixels(imageSource);
}

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

async function extractDominantColors(pixels: NdArray<Uint8Array>, colorCount: number): Promise<number[][]> {
    const pixelArray: number[][] = [];
    const shape = pixels.shape;

    for (let y = 0; y < shape[0]; y++) {
        for (let x = 0; x < shape[1]; x++) {
            const r = pixels.get(y, x, 0);
            const g = pixels.get(y, x, 1);
            const b = pixels.get(y, x, 2);
            pixelArray.push([r, g, b]);
        }
    }

    const colorMap = quantize(pixelArray, colorCount);
    return colorMap.palette();
}

function formatColors(colors: number[][], format: string) {
    return colors.map(color => {
        if (format === 'rgb') {
            return { r: color[0], g: color[1], b: color[2] };
        } else {
            return rgbToHex(color[0], color[1], color[2]);
        }
    });
}


export class DominantColorExtractor implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Dominant Color Extractor',
        name: 'dominantColorExtractor',
        icon: 'fa:palette',
        group: ['transform'],
        version: 1,
        description: 'Extract dominant colors from an image',
        defaults: {
            name: 'Dominant Color Extractor',
            color: '#772244',
        },
        inputs: ['main'] as NodeConnectionType[],
        outputs: ['main'] as NodeConnectionType[],
        properties: [
            {
                displayName: 'Image URL or Binary',
                name: 'imageSource',
                type: 'string',
                default: '',
                description: 'URL of the image or binary data',
            },
            {
                displayName: 'Number of Colors',
                name: 'colorCount',
                type: 'number',
                default: 5,
                description: 'How many dominant colors to extract',
            },
            {
                displayName: 'Output Format',
                name: 'outputFormat',
                type: 'options',
                options: [
                    {
                        name: 'HEX',
                        value: 'hex',
                    },
                    {
                        name: 'RGB',
                        value: 'rgb',
                    },
                ],
                default: 'hex',
                description: 'Format of the output colors',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const imageSource = this.getNodeParameter('imageSource', i) as string;
            const colorCount = this.getNodeParameter('colorCount', i) as number;
            const outputFormat = this.getNodeParameter('outputFormat', i) as string;

            try {
                const pixels = await getPixelsFromSource(imageSource);
                const colors = await extractDominantColors(pixels, colorCount);
                const formattedColors = formatColors(colors, outputFormat);

                returnData.push({
                    json: {
                        colors: formattedColors,
                        count: colorCount,
                    },
                });
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                } else {
                    throw error;
                }
            }
        }

        return [returnData];
    }








}