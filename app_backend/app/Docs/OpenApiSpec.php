<?php

namespace App\Docs;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Savely API',
    description: 'API documentation for Savely personal finance application'
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'Local server'
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Enter Bearer token'
)]
class OpenApiSpec
{
    #[OA\Post(
        path: '/api/login',
        summary: 'Login user',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'milica.marjanovic@gmail.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'milica.marjanovic'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Login successful'),
            new OA\Response(response: 401, description: 'Invalid login credentials'),
        ]
    )]
    public function login(): void
    {
    }

    #[OA\Post(
        path: '/api/register',
        summary: 'Register user',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'surname', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Milica'),
                    new OA\Property(property: 'surname', type: 'string', example: 'Marjanovic'),
                    new OA\Property(property: 'email', type: 'string', example: 'milica.marjanovic@gmail.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'milica.marjanovic'),
                    new OA\Property(property: 'password_confirmation', type: 'string', example: 'milica.marjanovic'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'User created'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function register(): void
    {
    }
        #[OA\Get(
        path: '/api/expenses',
        summary: 'Get all expenses',
        tags: ['Expenses'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'List of expenses'),
            new OA\Response(response: 401, description: 'Unauthorized'),
        ]
    )]
    public function getExpenses(): void
    {
    }

    #[OA\Post(
        path: '/api/expenses',
        summary: 'Create new expense',
        tags: ['Expenses'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string', example: 'Groceries'),
                    new OA\Property(property: 'amount', type: 'number', format: 'float', example: 2500),
                    new OA\Property(property: 'category', type: 'string', example: 'Food'),
                    new OA\Property(property: 'date', type: 'string', format: 'date', example: '2026-03-09'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Expense created'),
            new OA\Response(response: 401, description: 'Unauthorized'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function createExpense(): void
    {
    }

    #[OA\Get(
        path: '/api/expenses/{id}',
        summary: 'Get single expense',
        tags: ['Expenses'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Expense details'),
            new OA\Response(response: 404, description: 'Expense not found'),
        ]
    )]
    public function showExpense(): void
    {
    }

    #[OA\Put(
        path: '/api/expenses/{id}',
        summary: 'Update expense',
        tags: ['Expenses'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string', example: 'Groceries'),
                    new OA\Property(property: 'amount', type: 'number', format: 'float', example: 3000),
                    new OA\Property(property: 'category', type: 'string', example: 'Food'),
                    new OA\Property(property: 'date', type: 'string', format: 'date', example: '2026-03-09'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Expense updated'),
            new OA\Response(response: 404, description: 'Expense not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function updateExpense(): void
    {
    }

    #[OA\Delete(
        path: '/api/expenses/{id}',
        summary: 'Delete expense',
        tags: ['Expenses'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Expense deleted'),
            new OA\Response(response: 404, description: 'Expense not found'),
        ]
    )]
    public function deleteExpense(): void
    {
    }

    #[OA\Patch(
        path: '/api/expenses/{id}/month',
        summary: 'Update expense month',
        tags: ['Expenses'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'month', type: 'integer', example: 3)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Expense month updated'),
            new OA\Response(response: 404, description: 'Expense not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function updateExpenseMonth(): void
    {
    }
}
