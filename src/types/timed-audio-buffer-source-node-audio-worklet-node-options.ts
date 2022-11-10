import { IAudioBuffer, IAudioWorkletNodeOptions } from 'standardized-audio-context';
import { ITimingObject } from 'timing-object';
import { TFixedOptions } from './fixed-options';

export type TTimedAudioBufferSourceNodeAudioWorkletNodeOptions = Omit<IAudioWorkletNodeOptions, TFixedOptions> & {
    buffer: IAudioBuffer;

    timingObject: ITimingObject;
};
