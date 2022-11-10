import { TNativeAudioBuffer, TNativeAudioWorkletNodeOptions } from 'standardized-audio-context';
import { ITimingObject } from 'timing-object';
import { TFixedOptions } from './fixed-options';

export type TNativeTimedAudioBufferSourceNodeAudioWorkletNodeOptions = Omit<TNativeAudioWorkletNodeOptions, TFixedOptions> & {
    buffer: TNativeAudioBuffer;

    timingObject: ITimingObject;
};
