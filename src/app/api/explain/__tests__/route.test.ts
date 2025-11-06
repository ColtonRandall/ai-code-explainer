import { POST } from '../route'
import { NextResponse } from 'next/server'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ...data,
    })),
  },
}))

describe('POST /api/explain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENROUTER_API_KEY = 'test-api-key'
  })

  it('returns 400 error when code is missing', async () => {
    const req = {
      json: async () => ({}),
    } as Request

    await POST(req)

    expect(NextResponse.json).toHaveBeenCalledWith({
      error: 'Node code provided',
      status: 400,
    })
  })

  it('returns 400 error when code is not a string', async () => {
    const req = {
      json: async () => ({ code: 123 }),
    } as Request

    await POST(req)

    expect(NextResponse.json).toHaveBeenCalledWith({
      error: 'Node code provided',
      status: 400,
    })
  })

  it('returns 400 error when code is empty string', async () => {
    const req = {
      json: async () => ({ code: '' }),
    } as Request

    await POST(req)

    expect(NextResponse.json).toHaveBeenCalledWith({
      error: 'Node code provided',
      status: 400,
    })
  })

  it('calls OpenRouter API with correct parameters', async () => {
    const testCode = 'console.log("test")'
    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: 'This code prints "test" to the console',
            },
          },
        ],
      },
    }

    mockedAxios.post.mockResolvedValueOnce(mockResponse)

    const req = {
      json: async () => ({ code: testCode }),
    } as Request

    await POST(req)

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful programming assistant. Explain the provided code clearly, concisely, and simply.',
          },
          {
            role: 'user',
            content: `Explain this code: \n\n${testCode}`,
          },
        ],
      },
      {
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Code Explainer',
        },
      }
    )
  })

  it('returns explanation on successful API call', async () => {
    const testCode = 'const x = 5'
    const mockExplanation = 'This declares a constant variable x with value 5'
    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: mockExplanation,
            },
          },
        ],
      },
    }

    mockedAxios.post.mockResolvedValueOnce(mockResponse)

    const req = {
      json: async () => ({ code: testCode }),
    } as Request

    await POST(req)

    expect(NextResponse.json).toHaveBeenCalledWith({
      explanation: mockExplanation,
    })
  })

  it('returns 500 error when API call fails', async () => {
    const testCode = 'test code'
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'))

    const req = {
      json: async () => ({ code: testCode }),
    } as Request

    await POST(req)

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        error: 'Failed to generate explanation.',
      },
      {
        status: 500,
      }
    )
  })

  it('handles network errors gracefully', async () => {
    const testCode = 'function test() {}'
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))

    const req = {
      json: async () => ({ code: testCode }),
    } as Request

    await POST(req)

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        error: 'Failed to generate explanation.',
      },
      {
        status: 500,
      }
    )
  })
})
