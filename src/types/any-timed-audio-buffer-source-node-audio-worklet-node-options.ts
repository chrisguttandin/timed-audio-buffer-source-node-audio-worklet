import { TAnyContext, TContext } from 'standardized-audio-context';
import { TNativeTimedAudioBufferSourceNodeAudioWorkletNodeOptions } from './native-timed-audio-buffer-source-node-audio-worklet-node-options';
import { TTimedAudioBufferSourceNodeAudioWorkletNodeOptions } from './timed-audio-buffer-source-node-audio-worklet-node-options';

export type TAnyTimedAudioBufferSourceNodeAudioWorkletNodeOptions<T extends TAnyContext> = T extends TContext
    ? TTimedAudioBufferSourceNodeAudioWorkletNodeOptions
    : TNativeTimedAudioBufferSourceNodeAudioWorkletNodeOptions;
