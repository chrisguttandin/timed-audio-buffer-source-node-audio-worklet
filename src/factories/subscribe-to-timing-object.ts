import {
    IAudioBufferSourceNode,
    IAudioWorkletNode,
    TContext,
    TNativeAudioBufferSourceNode,
    TNativeAudioWorkletNode,
    TNativeContext
} from 'standardized-audio-context';
import { ITimingObject } from 'timing-object';
import type { createScheduleAudioBufferSourceNode } from './schedule-audio-buffer-source-node';

export const createSubscribeToTimingObject =
    (scheduleAudioBufferSourceNode: ReturnType<typeof createScheduleAudioBufferSourceNode>) =>
    <T extends TContext | TNativeContext>(
        audioWorkletNode: T extends TContext ? IAudioWorkletNode<T> : TNativeAudioWorkletNode,
        context: T,
        createAudioBufferSourceNode: T extends TContext
            ? (context: TContext) => IAudioBufferSourceNode<TContext>
            : (context: TNativeContext) => TNativeAudioBufferSourceNode,
        timingObject: ITimingObject
    ) => {
        let hasPendingUpdate = false;
        let isSendingUpdate = false;

        const scheduleUpdate = () => {
            hasPendingUpdate = false;

            scheduleAudioBufferSourceNode(audioWorkletNode, context, createAudioBufferSourceNode, timingObject).then(() => {
                if (hasPendingUpdate) {
                    scheduleUpdate();
                } else {
                    isSendingUpdate = false;
                }
            });
        };
        const listener = () => {
            if (isSendingUpdate) {
                hasPendingUpdate = true;
            } else {
                isSendingUpdate = true;

                scheduleUpdate();
            }
        };

        timingObject.addEventListener('change', listener);

        return () => timingObject.removeEventListener('change', listener);
    };
