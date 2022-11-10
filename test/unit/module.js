import { AudioContext, AudioWorkletNode } from 'standardized-audio-context';
import { addTimedAudioBufferSourceNodeAudioWorkletModule, createTimedAudioBufferSourceNodeAudioWorkletNode } from '../../src/module';
import { spy } from 'sinon';

describe('module', () => {
    describe('addTimedAudioBufferSourceNodeAudioWorkletModule()', () => {
        it('should call the given function with an URL', () => {
            const addAudioWorkletModule = spy();

            addTimedAudioBufferSourceNodeAudioWorkletModule(addAudioWorkletModule);

            expect(addAudioWorkletModule).to.have.been.calledOnce;

            const { args } = addAudioWorkletModule.getCall(0);

            expect(args).to.have.a.lengthOf(1);
            expect(args[0]).to.be.a('string');
            expect(args[0]).to.match(/^blob:/);
        });
    });

    describe('createTimedAudioBufferSourceNodeAudioWorkletNode()', () => {
        const testCases = {
            'with a native AudioContext': {
                audioWorkletNodeConstructor: window.AudioWorkletNode,
                createAddAudioWorkletModule: (context) => (url) => context.audioWorklet.addModule(url),
                createContext: () => new window.AudioContext()
            },
            'with a standardized AudioContext': {
                audioWorkletNodeConstructor: AudioWorkletNode,
                createAddAudioWorkletModule: (context) => (url) => context.audioWorklet.addModule(url),
                createContext: () => new AudioContext()
            }
        };

        if (window.AudioWorkletNode === undefined) {
            delete testCases['with a native AudioContext'];
        }

        for (const [description, { audioWorkletNodeConstructor, createAddAudioWorkletModule, createContext }] of Object.entries(
            testCases
        )) {
            describe(`with the ${description}`, () => {
                let context;
                let timedAudioBufferSourceNodeAudioWorkletNode;

                afterEach(() => {
                    if (context.close !== undefined) {
                        return context.close();
                    }
                });

                beforeEach(async () => {
                    context = createContext();

                    await addTimedAudioBufferSourceNodeAudioWorkletModule(createAddAudioWorkletModule(context));

                    timedAudioBufferSourceNodeAudioWorkletNode = createTimedAudioBufferSourceNodeAudioWorkletNode(audioWorkletNodeConstructor, context);
                });

                it('should return an instance of the EventTarget interface', () => {
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.addEventListener).to.be.a('function');
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.dispatchEvent).to.be.a('function');
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.removeEventListener).to.be.a('function');
                });

                it('should return an instance of the AudioNode interface', () => {
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.channelCount).to.equal(2);
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.channelCountMode).to.equal(description.includes('standardized') ? 'explicit':'max');
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.channelInterpretation).to.equal('speakers');
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.connect).to.be.a('function');
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.context).to.be.an.instanceOf(context.constructor);
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.disconnect).to.be.a('function');
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.numberOfInputs).to.equal(0);
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.numberOfOutputs).to.equal(1);
                });

                it('should return an instance of the AudioWorkletNode interface', () => {
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.onprocessorerror).to.be.null;
                    expect(timedAudioBufferSourceNodeAudioWorkletNode.parameters).not.to.be.undefined;
                });

                describe('port', () => {
                    it('should throw an error', () => {
                        expect(() => {
                            timedAudioBufferSourceNodeAudioWorkletNode.port;
                        }).to.throw(Error, "The port of a TimedAudioBufferSourceNodeAudioWorkletNode can't be accessed.");
                    });
                });
            });
        }
    });
});
