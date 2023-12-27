import { IAudioWorkletNode, TContext } from 'standardized-audio-context';
import { ITimingObject } from 'timing-object';

export interface ITimedAudioBufferSourceNodeAudioWorkletNode<T extends TContext> extends IAudioWorkletNode<T> {
    timingObject: null | ITimingObject;
}
