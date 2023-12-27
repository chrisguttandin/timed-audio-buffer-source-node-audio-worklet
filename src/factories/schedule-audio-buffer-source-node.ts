import {
    IAudioBufferSourceNode,
    IAudioWorkletNode,
    TContext,
    TNativeAudioBufferSourceNode,
    TNativeAudioWorkletNode,
    TNativeContext
} from 'standardized-audio-context';
import { ITimingObject } from 'timing-object';
import type { createConvertToContextFrame } from './convert-to-context-frame';

export const createScheduleAudioBufferSourceNode =
    (convertToContextFrame: ReturnType<typeof createConvertToContextFrame>) =>
    <T extends TContext | TNativeContext>(
        audioWorkletNode: T extends TContext ? IAudioWorkletNode<T> : TNativeAudioWorkletNode,
        context: T,
        createAudioBufferSourceNode: T extends TContext
            ? (context: TContext) => IAudioBufferSourceNode<TContext>
            : (context: TNativeContext) => TNativeAudioBufferSourceNode,
        timingObject: ITimingObject
    ): Promise<void> => {
        const audioBuffer = new AudioBuffer({ length: 3, sampleRate: context.sampleRate });
        const audioBufferSourceNode = createAudioBufferSourceNode(<any>context);
        const { position, timestamp, velocity } = timingObject.query();

        audioBuffer.copyToChannel(new Float32Array([position, convertToContextFrame(context, timestamp), velocity]), 0);

        audioBufferSourceNode.buffer = audioBuffer;

        const promise = new Promise<void>((resolve) => audioBufferSourceNode.addEventListener('ended', () => resolve(), { once: true }));

        audioBufferSourceNode.connect(<any>audioWorkletNode);
        audioBufferSourceNode.start();

        return promise;
    };
