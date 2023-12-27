import { AudioBuffer, AudioBufferSourceNode, AudioContext, AudioWorkletNode } from 'standardized-audio-context';
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
            'a native AudioContext': {
                audioBufferConstructors: [
                    ['a native AudioBuffer', window.AudioBuffer],
                    ['a standardized AudioBuffer', AudioBuffer]
                ],
                audioWorkletNodeConstructor: window.AudioWorkletNode,
                createAddAudioWorkletModule: (context) => (url) => context.audioWorklet.addModule(url),
                createAudioBufferSourceNode: (context) => context.createBufferSource(),
                createContext: () => new window.AudioContext()
            },
            'a standardized AudioContext': {
                audioBufferConstructors: [
                    ['a native AudioBuffer', window.AudioBuffer],
                    ['a standardized AudioBuffer', AudioBuffer]
                ],
                audioWorkletNodeConstructor: AudioWorkletNode,
                createAddAudioWorkletModule: (context) => (url) => context.audioWorklet.addModule(url),
                createAudioBufferSourceNode: (context) => new AudioBufferSourceNode(context),
                createContext: () => new AudioContext()
            }
        };

        if (window.AudioWorkletNode === undefined) {
            delete testCases['with a native AudioContext'];
        }

        for (const [
            audioContextName,
            {
                audioBufferConstructors,
                audioWorkletNodeConstructor,
                createAddAudioWorkletModule,
                createAudioBufferSourceNode,
                createContext
            }
        ] of Object.entries(testCases)) {
            describe(`with ${audioContextName}`, () => {
                let context;

                afterEach(() => {
                    if (context.close !== undefined) {
                        return context.close();
                    }
                });

                beforeEach(async () => {
                    context = createContext();

                    await addTimedAudioBufferSourceNodeAudioWorkletModule(createAddAudioWorkletModule(context));
                });

                describe('with valid options', () => {
                    for (const [audioBufferName, audioBufferConstructor] of [['no AudioBuffer', null], ...audioBufferConstructors]) {
                        for (const [timingObjectName, withTimingObject] of [
                            ['a TimingObject', true],
                            ['no TimingObject', false]
                        ]) {
                            describe(`with ${audioBufferName} and ${timingObjectName}`, () => {
                                let timedAudioBufferSourceNodeAudioWorkletNode;
                                let timingObject;

                                beforeEach(() => {
                                    timingObject = withTimingObject
                                        ? { addEventListener: spy(), query: spy(), removeEventListener: spy() }
                                        : null;
                                    timedAudioBufferSourceNodeAudioWorkletNode =
                                        audioBufferConstructor === null && timingObject === null
                                            ? createTimedAudioBufferSourceNodeAudioWorkletNode(
                                                  audioWorkletNodeConstructor,
                                                  context,
                                                  createAudioBufferSourceNode
                                              )
                                            : createTimedAudioBufferSourceNodeAudioWorkletNode(
                                                  audioWorkletNodeConstructor,
                                                  context,
                                                  createAudioBufferSourceNode,
                                                  {
                                                      ...(audioBufferConstructor === null
                                                          ? null
                                                          : {
                                                                // eslint-disable-next-line new-cap
                                                                buffer: new audioBufferConstructor({
                                                                    length: 1,
                                                                    sampleRate: context.sampleRate
                                                                })
                                                            }),
                                                      ...(timingObject === null ? null : { timingObject })
                                                  }
                                              );
                                });

                                it('should return an instance of the EventTarget interface', () => {
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.addEventListener).to.be.a('function');
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.dispatchEvent).to.be.a('function');
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.removeEventListener).to.be.a('function');
                                });

                                it('should return an instance of the AudioNode interface', () => {
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.channelCount).to.equal(2);
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.channelCountMode).to.equal(
                                        audioContextName.includes('standardized') ? 'explicit' : 'max'
                                    );
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.channelInterpretation).to.equal('speakers');
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.connect).to.be.a('function');
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.context).to.be.an.instanceOf(context.constructor);
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.disconnect).to.be.a('function');
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.numberOfInputs).to.equal(1);
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.numberOfOutputs).to.equal(1);
                                });

                                it('should return an instance of the AudioWorkletNode interface', () => {
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.onprocessorerror).to.be.null;
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.parameters).not.to.be.undefined;
                                });

                                it('should return an instance of the TimedAudioBufferSourceNodeAudioWorkletNode interface', () => {
                                    expect(timedAudioBufferSourceNodeAudioWorkletNode.timingObject).to.equal(timingObject);
                                });

                                describe('port', () => {
                                    it('should throw an error', () => {
                                        expect(() => {
                                            timedAudioBufferSourceNodeAudioWorkletNode.port;
                                        }).to.throw(Error, "The port of a TimedAudioBufferSourceNodeAudioWorkletNode can't be accessed.");
                                    });
                                });

                                describe('timingObject', () => {
                                    it('should be assignable to null', () => {
                                        timedAudioBufferSourceNodeAudioWorkletNode.timingObject = null;

                                        expect(timedAudioBufferSourceNodeAudioWorkletNode.timingObject).to.be.null;
                                    });

                                    if (withTimingObject) {
                                        it('should call addEventListener() on the given timingObject', () => {
                                            const listener = timingObject.addEventListener.getCall(0).args[1];

                                            expect(timingObject.addEventListener).to.have.been.calledOnceWithExactly('change', listener);
                                        });

                                        it('should call removeEventListener() on the given timingObject', () => {
                                            const listener = timingObject.addEventListener.getCall(0).args[1];

                                            timedAudioBufferSourceNodeAudioWorkletNode.timingObject = null;

                                            expect(timingObject.removeEventListener).to.have.been.calledOnceWithExactly('change', listener);
                                        });
                                    }

                                    it('should not be assignable to a TimingObject', () => {
                                        expect(() => {
                                            timedAudioBufferSourceNodeAudioWorkletNode.timingObject = Symbol('TimingObject');
                                        }).to.throw(TypeError, 'A TimingObject can only be set in the constructor.');
                                    });
                                });
                            });
                        }
                    }
                });

                describe('with invalid options', () => {
                    for (const [audioBufferName, audioBufferConstructor] of audioBufferConstructors) {
                        describe(`with ${audioBufferName}`, () => {
                            describe('with a different sampleRate than the context', () => {
                                it('should throw a TypeError', () => {
                                    expect(() => {
                                        createTimedAudioBufferSourceNodeAudioWorkletNode(
                                            audioWorkletNodeConstructor,
                                            context,
                                            createAudioBufferSourceNode,
                                            {
                                                // eslint-disable-next-line new-cap
                                                buffer: new audioBufferConstructor({
                                                    length: 1,
                                                    sampleRate: context.sampleRate === 48000 ? 44100 : 48000
                                                })
                                            }
                                        );
                                    }).to.throw(TypeError, 'The AudioBuffer must have the same sampleRate as the AudioContext.');
                                });
                            });
                        });
                    }
                });
            });
        }
    });
});
