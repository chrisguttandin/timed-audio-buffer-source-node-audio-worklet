import {
    IAudioBufferSourceNode,
    IAudioWorkletNode,
    TAudioWorkletNodeConstructor,
    TContext,
    TNativeAudioBufferSourceNode,
    TNativeAudioWorkletNode,
    TNativeAudioWorkletNodeConstructor,
    TNativeContext
} from 'standardized-audio-context';
import { createConvertToContextFrame } from './factories/convert-to-context-frame';
import { createPerformance } from './factories/performance';
import { createScheduleAudioBufferSourceNode } from './factories/schedule-audio-buffer-source-node';
import { createSubscribeToTimingObject } from './factories/subscribe-to-timing-object';
import { ITimedAudioBufferSourceNodeAudioWorkletNode } from './interfaces';
import {
    TAnyAudioWorkletNodeOptions,
    TAnyTimedAudioBufferSourceNodeAudioWorkletNodeOptions,
    TFixedOptions,
    TNativeTimedAudioBufferSourceNodeAudioWorkletNode
} from './types';
import { worklet } from './worklet/worklet';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

const blob = new Blob([worklet], { type: 'application/javascript; charset=utf-8' });

export const addTimedAudioBufferSourceNodeAudioWorkletModule = async (addAudioWorkletModule: (url: string) => Promise<void>) => {
    const url = URL.createObjectURL(blob);

    try {
        await addAudioWorkletModule(url);
    } finally {
        URL.revokeObjectURL(url);
    }
};

const convertToContextFrame = createConvertToContextFrame(createPerformance());
const subscribeToTimingObject = createSubscribeToTimingObject(createScheduleAudioBufferSourceNode(convertToContextFrame));

export function createTimedAudioBufferSourceNodeAudioWorkletNode<T extends TContext | TNativeContext>(
    audioWorkletNodeConstructor: T extends TContext ? TAudioWorkletNodeConstructor : TNativeAudioWorkletNodeConstructor,
    context: T,
    createAudioBufferSourceNode: T extends TContext
        ? (context: TContext) => IAudioBufferSourceNode<TContext>
        : (context: TNativeContext) => TNativeAudioBufferSourceNode,
    options: Partial<TAnyTimedAudioBufferSourceNodeAudioWorkletNodeOptions<T>> = {}
): T extends TContext ? ITimedAudioBufferSourceNodeAudioWorkletNode<T> : TNativeTimedAudioBufferSourceNodeAudioWorkletNode {
    type TAnyAudioWorkletNode = T extends TContext ? IAudioWorkletNode<T> : TNativeAudioWorkletNode;
    type TAnyTimedAudioBufferSourceNodeAudioWorkletNode = T extends TContext
        ? ITimedAudioBufferSourceNodeAudioWorkletNode<T>
        : TNativeTimedAudioBufferSourceNodeAudioWorkletNode;

    const { buffer = null } = options;

    if (buffer instanceof AudioBuffer && buffer.sampleRate !== context.sampleRate) {
        throw new TypeError('The AudioBuffer must have the same sampleRate as the AudioContext.');
    }

    let { timingObject = null } = options;

    const { position = 0, timestamp = 0, velocity = 0 } = timingObject?.query() ?? {};
    const fixedOptions: Required<Pick<TAnyAudioWorkletNodeOptions<T>, TFixedOptions>> = {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [buffer?.numberOfChannels ?? 1],
        processorOptions: {
            buffer:
                buffer instanceof AudioBuffer
                    ? Array.from({ length: buffer.numberOfChannels }, (_, channel) => buffer.getChannelData(channel))
                    : null,
            position,
            timestamp: convertToContextFrame(context, timestamp),
            velocity
        }
    };
    const audioWorkletNode: TAnyAudioWorkletNode = new (<any>audioWorkletNodeConstructor)(
        context,
        'timed-audio-buffer-source-node-audio-worklet-processor',
        {
            ...options,
            ...fixedOptions
        }
    );

    let removeListener: null | (() => void) = null;

    Object.defineProperties(audioWorkletNode, {
        port: {
            get(): TAnyTimedAudioBufferSourceNodeAudioWorkletNode['port'] {
                throw new Error("The port of a TimedAudioBufferSourceNodeAudioWorkletNode can't be accessed.");
            }
        },
        timingObject: {
            get: () => timingObject,
            set: (value: TAnyTimedAudioBufferSourceNodeAudioWorkletNode['timingObject']) => {
                removeListener?.();

                removeListener = null;

                if (value === null) {
                    timingObject = value;
                } else {
                    throw new TypeError('A TimingObject can only be set in the constructor.');
                }
            }
        }
    });

    if (timingObject !== null) {
        removeListener = subscribeToTimingObject(audioWorkletNode, context, createAudioBufferSourceNode, timingObject);
    }

    return <TAnyTimedAudioBufferSourceNodeAudioWorkletNode>audioWorkletNode;
}
