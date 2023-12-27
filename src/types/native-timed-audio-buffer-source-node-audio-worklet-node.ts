import { TNativeAudioWorkletNode } from 'standardized-audio-context';
import { ITimingObject } from 'timing-object';

export type TNativeTimedAudioBufferSourceNodeAudioWorkletNode = TNativeAudioWorkletNode & {
    timingObject: null | ITimingObject;
};
