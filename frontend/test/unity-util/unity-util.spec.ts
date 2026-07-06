import { UnityUtil } from '../../src/globals/unity-util';
import { ExternalWebRequestHandler } from '../../src/globals/unity-externalwebrequesthandler';
import { IndexedDbCache } from '../../src/globals/unity-indexedbcache';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';

const TEST_TEXT = 'Hello World Test Data';
const TEST_JSON = { name: 'Test Model', version: 1.0, data: [1, 2, 3] };
const TEST_BINARY = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
const LARGE_RESPONSE_SIZE = 1024 * 100;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates a deterministic offline fetch interceptor for the UnityUtil tests.
 *
 * The handler under test accepts an interceptor with the same shape as `fetch`
 * and then consumes the returned `Response` via `response.arrayBuffer()`.
 * This factory returns a function that maps specific test URLs to specific
 * response types so each test can exercise one response-handling path:
 *
 * - `string-test`: plain text payload
 * - `json-test`: JSON payload with content-type header
 * - `binary-test`: binary payload as `Uint8Array`
 * - `large-test`: large binary payload with an artificial delay to simulate
 *   a slower response before the handler reads and caches it
 * - `stream-test`: streamed text payload using `ReadableStream`
 * - `exception-test`: throws to simulate interceptor failure
 * - any other URL: returns `404 Not Found`
 *
 * The small delays make the async behavior observable in tests without relying
 * on the network, while keeping the responses fully controlled and repeatable.
 */
const createExactOfflineFetchInterceptor = () => async (url: string) => {
    if (url.includes('string-test')) {
        await delay(1);
        return new Response(TEST_TEXT, { status: 200 });
    }

    if (url.includes('json-test')) {
        await delay(1);
        return new Response(JSON.stringify(TEST_JSON), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (url.includes('binary-test')) {
        await delay(1);
        return new Response(TEST_BINARY, { status: 200 });
    }

    if (url.includes('large-test')) {
        const largeData = new Uint8Array(LARGE_RESPONSE_SIZE);
        for (let i = 0; i < LARGE_RESPONSE_SIZE; i++) {
            largeData[i] = i % 256;
        }

        await delay(10);
        return new Response(largeData, { status: 200 });
    }

    if (url.includes('stream-test')) {
        const streamText = 'streamed response payload';
        const encoded = new TextEncoder().encode(streamText);
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoded.slice(0, 8));
                controller.enqueue(encoded.slice(8));
                controller.close();
            },
        });

        return new Response(stream, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    if (url.includes('exception-test')) {
        throw new Error('offline interceptor failed');
    }

    return new Response('Not found', { status: 404 });
};

describe('UnityUtil.setOfflineFetchInterceptor', () => {
    let cacheMock: IndexedDbCache;
    let handler: ExternalWebRequestHandler;
    let sendMessageMock: jest.Mock;
    let originalFetch: any;

    const waitForOnWebResponse = () => {
        const { promiseToResolve, resolve } = getWaitablePromise();
        sendMessageMock.mockImplementationOnce(() => resolve(true));
        return promiseToResolve;
    };

    beforeEach(() => {
        originalFetch = (global as any).fetch;
        (global as any).fetch = jest.fn();

        cacheMock = {
            read: jest.fn().mockResolvedValue(undefined),
            write: jest.fn(),
        } as unknown as IndexedDbCache;

        handler = new ExternalWebRequestHandler(cacheMock);
        sendMessageMock = jest.fn();
        handler.setUnityInstance({ SendMessage: sendMessageMock }, 'WebRequestHandler');

        UnityUtil.externalWebRequestHandler = handler;
    });

    afterEach(() => {
        (global as any).fetch = originalFetch;
        UnityUtil.externalWebRequestHandler = undefined;
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('should register interceptor through UnityUtil and handle text response', async () => {
        const interceptor = createExactOfflineFetchInterceptor();
        const responsePromise = waitForOnWebResponse();

        UnityUtil.setOfflineFetchInterceptor(interceptor);
        handler.createGetRequest(1, 'string-test', true);

        await responsePromise;

        expect(handler.offlineFetchInterceptor).toBe(interceptor);
        expect(cacheMock.write).toHaveBeenCalledTimes(1);

        const writtenBuffer = (cacheMock.write as jest.Mock).mock.calls[0][1] as ArrayBuffer;
        expect(new TextDecoder().decode(writtenBuffer)).toBe(TEST_TEXT);
        expect(handler.getResponseString(1)).toBe(TEST_TEXT);
        expect(sendMessageMock).toHaveBeenCalledWith(
            'WebRequestHandler',
            'OnWebResponse',
            JSON.stringify({
                id: 1,
                size: writtenBuffer.byteLength,
            }),
        );
        expect((global as any).fetch).not.toHaveBeenCalled();
    });

    it('should register interceptor through UnityUtil and handle json response', async () => {
        const interceptor = createExactOfflineFetchInterceptor();
        const responsePromise = waitForOnWebResponse();

        UnityUtil.setOfflineFetchInterceptor(interceptor);
        handler.createGetRequest(2, 'json-test', true);

        await responsePromise;

        expect(cacheMock.write).toHaveBeenCalledTimes(1);

        const writtenBuffer = (cacheMock.write as jest.Mock).mock.calls[0][1] as ArrayBuffer;
        expect(JSON.parse(new TextDecoder().decode(writtenBuffer))).toEqual(TEST_JSON);
        expect(JSON.parse(handler.getResponseString(2))).toEqual(TEST_JSON);
        expect(sendMessageMock).toHaveBeenCalledWith(
            'WebRequestHandler',
            'OnWebResponse',
            JSON.stringify({
                id: 2,
                size: writtenBuffer.byteLength,
            }),
        );
        expect((global as any).fetch).not.toHaveBeenCalled();
    });

    it('should register interceptor through UnityUtil and handle binary response', async () => {
        const interceptor = createExactOfflineFetchInterceptor();
        const responsePromise = waitForOnWebResponse();

        UnityUtil.setOfflineFetchInterceptor(interceptor);
        handler.createGetRequest(3, 'binary-test', true);

        await responsePromise;

        expect(cacheMock.write).toHaveBeenCalledTimes(1);

        const writtenBuffer = (cacheMock.write as jest.Mock).mock.calls[0][1] as ArrayBuffer;
        expect(Array.from(new Uint8Array(writtenBuffer))).toEqual(Array.from(TEST_BINARY));
        expect(Array.from(new Uint8Array(handler.requests[3].data))).toEqual(Array.from(TEST_BINARY));
        expect(sendMessageMock).toHaveBeenCalledWith(
            'WebRequestHandler',
            'OnWebResponse',
            JSON.stringify({
                id: 3,
                size: writtenBuffer.byteLength,
            }),
        );
        expect((global as any).fetch).not.toHaveBeenCalled();
    });

    it('should handle large response and cache the result', async () => {

        const interceptor = createExactOfflineFetchInterceptor();
        const responsePromise = waitForOnWebResponse();

        UnityUtil.setOfflineFetchInterceptor(interceptor);
        handler.createGetRequest(4, 'large-test', true);

        await responsePromise;

        expect(cacheMock.write).toHaveBeenCalledTimes(1);

        const writtenBuffer = (cacheMock.write as jest.Mock).mock.calls[0][1] as ArrayBuffer;
        expect(writtenBuffer.byteLength).toBe(LARGE_RESPONSE_SIZE);
        expect(sendMessageMock).toHaveBeenCalledWith(
            'WebRequestHandler',
            'OnWebResponse',
            JSON.stringify({
                id: 4,
                size: LARGE_RESPONSE_SIZE,
            }),
        );
        expect((global as any).fetch).not.toHaveBeenCalled();
    });

    it('should register interceptor through UnityUtil and handle stream response', async () => {
        const interceptor = createExactOfflineFetchInterceptor();
        const responsePromise = waitForOnWebResponse();

        UnityUtil.setOfflineFetchInterceptor(interceptor);
        handler.createGetRequest(5, 'stream-test', true);

        await responsePromise;

        expect(cacheMock.write).toHaveBeenCalledTimes(1);

        const writtenBuffer = (cacheMock.write as jest.Mock).mock.calls[0][1] as ArrayBuffer;
        expect(new TextDecoder().decode(writtenBuffer)).toBe('streamed response payload');
        expect(handler.getResponseString(5)).toBe('streamed response payload');
        expect(sendMessageMock).toHaveBeenCalledWith(
            'WebRequestHandler',
            'OnWebResponse',
            JSON.stringify({
                id: 5,
                size: writtenBuffer.byteLength,
            }),
        );
        expect((global as any).fetch).not.toHaveBeenCalled();
    });

    it('should return size -1 when interceptor returns 404 response', async () => {
        const interceptor = createExactOfflineFetchInterceptor();
        const responsePromise = waitForOnWebResponse();
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        UnityUtil.setOfflineFetchInterceptor(interceptor);
        handler.createGetRequest(6, 'missing-resource', false);

        await responsePromise;

        expect(cacheMock.write).not.toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(sendMessageMock).toHaveBeenCalledWith(
            'WebRequestHandler',
            'OnWebResponse',
            JSON.stringify({
                id: 6,
                size: -1,
            }),
        );
        expect((global as any).fetch).not.toHaveBeenCalled();
    });

    it('should return size -1 and log error when interceptor throws exception', async () => {
        const interceptor = createExactOfflineFetchInterceptor();
        const responsePromise = waitForOnWebResponse();
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        UnityUtil.setOfflineFetchInterceptor(interceptor);
        handler.createGetRequest(7, 'exception-test', false);

        await responsePromise;

        expect(cacheMock.write).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect((consoleErrorSpy.mock.calls[0][0] as Error).message).toBe('offline interceptor failed');
        expect(sendMessageMock).toHaveBeenCalledWith(
            'WebRequestHandler',
            'OnWebResponse',
            JSON.stringify({
                id: 7,
                size: -1,
            }),
        );
        expect((global as any).fetch).not.toHaveBeenCalled();
    });
});

describe('UnityUtil.doAutorecovery', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        UnityUtil.viewer = undefined;
        UnityUtil.unityInstance = undefined;
        UnityUtil.readyPromise = undefined;
        UnityUtil.loadingPromise = undefined;
        UnityUtil.loadingResolve = undefined;
        UnityUtil.loadedPromise = undefined;
        UnityUtil.loadedResolve = undefined;
        UnityUtil.loadedFlag = false;
    });

    it('should capture state, rebuild canvas, restore state and notify viewer', async () => {
        const savedState = new ArrayBuffer(16);
        const wrapper = document.createElement('div');
        const oldCanvas = document.createElement('canvas');
        wrapper.appendChild(oldCanvas);

        const quitMock = jest.fn().mockResolvedValue(undefined);
        const onAutorecoveryMock = jest.fn();
        const toUnitySpy = jest.spyOn(UnityUtil, 'toUnity').mockImplementation((methodName: string) => {
            if (methodName === 'CaptureAutorecoveryState') {
                UnityUtil.postAutorecoveryCapture(savedState);
            }
        });
        const hideProgressBarSpy = jest.spyOn(UnityUtil, 'hideProgressBar').mockImplementation(() => {});
        const loadUnitySpy = jest.spyOn(UnityUtil, '_loadUnity').mockImplementation(async () => {});

        UnityUtil.viewer = {
            onAutorecovery: onAutorecoveryMock,
        };

        UnityUtil.unityInstance = {
            Quit: quitMock,
            Module: {
                canvas: oldCanvas,
            },
        } as any;

        await UnityUtil.doAutorecovery();

        const newCanvas = wrapper.firstChild as HTMLCanvasElement;
        expect(quitMock).toHaveBeenCalledTimes(1);
        expect(newCanvas).not.toBe(oldCanvas);
        expect(newCanvas.tagName).toBe('CANVAS');
        expect(loadUnitySpy).toHaveBeenCalledWith(newCanvas, undefined);
        expect(toUnitySpy).toHaveBeenCalledWith('CaptureAutorecoveryState', UnityUtil.LoadingState.VIEWER_READY, undefined);
        expect(toUnitySpy).toHaveBeenCalledWith('RestoreAutorecoveryState', UnityUtil.LoadingState.VIEWER_READY, undefined);
        expect(hideProgressBarSpy).toHaveBeenCalledTimes(1);
        expect(onAutorecoveryMock).toHaveBeenCalledWith(newCanvas);
        expect(UnityUtil.getAutorecoveryCapture()).toBe(savedState);
    });
});

describe('UnityUtil.requestPointInfo', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        UnityUtil.unityInstance = undefined;
    });

    it('should reject invalid point info request', async () => {
        const invalidRequestCanvasPos = {
            x: 100,
            z: 200,
        };
        await expect(UnityUtil.requestPointInfo(invalidRequestCanvasPos as any)).rejects
            .toThrow('requestPointInfo: Invalid position object provided. Expected either a ClientPosition or CanvasPosition.');

        const invalidRequestClientPos = {
            clientX: 100,
            clientZ: 200,
        };
        await expect(UnityUtil.requestPointInfo(invalidRequestClientPos as any)).rejects
            .toThrow('requestPointInfo: Invalid position object provided. Expected either a ClientPosition or CanvasPosition.');

            const invalidRequestRandom = {
            foo: 'bar',
            bar: 123,
        };
        await expect(UnityUtil.requestPointInfo(invalidRequestRandom as any)).rejects
            .toThrow('requestPointInfo: Invalid position object provided. Expected either a ClientPosition or CanvasPosition.');
    });

    it('should not alter a CanvasPosition when passing it off to the viewer', async () => {
        const toUnitySpy = jest.spyOn(UnityUtil, 'toUnity').mockImplementation((methodName: string) => {
            UnityUtil.respondToPointInfoRequest(JSON.stringify({
                mousePos: [150, 250],
            }));
        });
        
        const canvasPosition = {
            x: 150,
            y: 250,
        };

        await UnityUtil.requestPointInfo(canvasPosition);

        expect(toUnitySpy).toHaveBeenCalledWith('RequestPointInfo', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(canvasPosition));
    });


    it('should alter a ClientPosition according to the canvas before passing it off to the viewer', async () => {
        const toUnitySpy = jest.spyOn(UnityUtil, 'toUnity').mockImplementation((methodName: string) => {
            UnityUtil.respondToPointInfoRequest(JSON.stringify({
                mousePos: [100, 249],
            }));
        });
        
        UnityUtil.unityInstance = {
            Module: {
                canvas: {
                    getBoundingClientRect: () => ({
                        left: 50,
                        top: 100,
                        height: 400,
                    }),
                },
            },
        } as any;

        const clientPosition = {
            clientX: 150,
            clientY: 250,
        };

        await UnityUtil.requestPointInfo(clientPosition);

        const expectedPosition = {
            x: 100, // 150 - 50 (canvas left)
            y: 249, // 400 (canvas height) - 1 (to offset pixel 0) - (250 - 100 (canvas top))
        };

        expect(toUnitySpy).toHaveBeenCalledWith('RequestPointInfo', UnityUtil.LoadingState.MODEL_LOADED, JSON.stringify(expectedPosition));
    });

    it('should resolve a valid request with point info', async () => {
        const toUnitySpy = jest.spyOn(UnityUtil, 'toUnity').mockImplementation((methodName: string) => {
            const mockPointInfo = {
                mousePos: [100, 200],
                foo: 'bar', // Some dummy
            }
            
            UnityUtil.respondToPointInfoRequest(JSON.stringify(mockPointInfo));
        });

        const canvasPosition = {
            x: 100,
            y: 200,
        };

        const pointInfo = await UnityUtil.requestPointInfo(canvasPosition);

        expect(toUnitySpy).toHaveBeenCalledTimes(1);

        expect(pointInfo).toEqual({
            mousePos: [100, 200],
            foo: 'bar',
        });
    });

    it('should drop all requests if the point info coming from the viewer is malformed', async () => {
      
        const toUnitySpy = jest.spyOn(UnityUtil, 'toUnity').mockImplementation((methodName: string) => {
            const mockPointInfo = 'malformed response';
            
            UnityUtil.respondToPointInfoRequest(mockPointInfo);
        });

        const canvasPosition = {
            x: 100,
            y: 200,
        };

        await expect(UnityUtil.requestPointInfo(canvasPosition)).rejects
            .toThrow('Unexpected token \'m\', "malformed response" is not valid JSON');
        
        expect(toUnitySpy).toHaveBeenCalledTimes(1);
    });
});