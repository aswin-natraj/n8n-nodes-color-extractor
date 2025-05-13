import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export const dominantColorExtractorDescription: INodeTypeDescription = {
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
        // Same as in the node.ts file
    ],
};