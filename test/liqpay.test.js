const LiqPay = require('../lib/liqpay'); // Adjust the path to your LiqPay class file
const crypto = require('crypto');
const axios = require('axios');

jest.mock('axios'); // This will mock the axios module
describe('LiqPay class', () => {

    let liqPayInstance;

    beforeEach(() => {
        liqPayInstance = new LiqPay('public key', 'Private key'); // Assuming you have a constructor in your LiqPay class
    });

    describe('cnb_form method', () => {

        let liqPayInstance;

        beforeEach(() => {
            liqPayInstance = new LiqPay('public key', 'Private key'); // Assuming you have a constructor in your LiqPay class
        });

        it('should return a form with correct data and signature', () => {
            const params = {
                action: 'pay',
                amount: '100',
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345',
                version: '3',
                language: 'ru'
            };

            const form = liqPayInstance.cnb_form(params);

            // Check if form contains the correct data and signature
            expect(form).toContain('name="data"');
            expect(form).toContain('name="signature"');

            // Check if the button label is set correctly
            expect(form).toContain('<sdk-button label="Оплатить"');
        });

        it('should default to Ukrainian language if no language is provided', () => {
            const params = {
                action: 'pay',
                amount: '100',
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345',
                version: '3'
            };

            const form = liqPayInstance.cnb_form(params);

            // Check if the button label is set to Ukrainian by default
            expect(form).toContain('<sdk-button label="Сплатити"');
        });

        it('should use the provided language for the button text', () => {
            const paramsWithLanguage = {
                version: 3,
                action: 'pay',
                amount: 100.5,
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345',
                language: 'ru' // Assuming 'ru' is a valid key in buttonTranslations
            };

            const form = liqPayInstance.cnb_form(paramsWithLanguage);
            expect(form).toContain('<sdk-button label="Оплатить"'); // Assuming 'Оплатить' is the translation for 'ru'
        });

    });

    describe('cnb_params method', () => {

        let liqPayInstance;

        beforeEach(() => {
            liqPayInstance = new LiqPay('public key', 'Private key'); // Assuming you have a constructor in your LiqPay class
        });

        it('should convert version and amount to numbers if they are valid strings', () => {
            const params = {
                version: '3',
                action: 'pay',
                amount: '100.5',
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345'
            };

            const result = liqPayInstance.cnb_params(params);

            expect(typeof result.version).toBe('number');
            expect(typeof result.amount).toBe('number');
        });

        it('should throw an error if version or amount are invalid strings', () => {
            const params = {
                version: 'invalid',
                action: 'pay',
                amount: '100.5',
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345'
            };

            expect(() => liqPayInstance.cnb_params(params)).toThrow('version must be a number or a string that can be converted to a number');
        });

        it('should convert other parameters to strings if they are not already strings', () => {
            const params = {
                version: 3,
                action: 'pay',
                amount: 100.5,
                currency: 123,
                description: true,
                order_id: 'order12345'
            };

            const result = liqPayInstance.cnb_params(params);

            expect(typeof result.currency).toBe('string');
            expect(typeof result.description).toBe('string');
        });

        it('should throw an error if a required parameter is missing', () => {
            const params = {
                version: 3,
                action: 'pay',
                amount: 100.5,
                currency: 'USD',
                // description is missing
                order_id: 'order12345'
            };

            expect(() => liqPayInstance.cnb_params(params)).toThrow('description is null or not provided');
        });

        it('should throw an error if an invalid language is provided', () => {
            const params = {
                version: 3,
                action: 'pay',
                amount: 100.5,
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345',
                language: 'es' // Spanish is not in the availableLanguages list
            };

            expect(() => liqPayInstance.cnb_params(params)).toThrow('Invalid language: es. Supported languages are: ru, uk, en');
        });
        it('should throw an error if version is missing', () => {
            const paramsWithoutVersion = {
                action: 'pay',
                amount: '100.5',
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345'
            };

            expect(() => liqPayInstance.cnb_params(paramsWithoutVersion)).toThrow('version is null');
        });

        it('should throw an error if amount is an invalid string', () => {
            const paramsWithInvalidAmount = {
                version: 3,
                action: 'pay',
                amount: 'invalidAmount',
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345'
            };

            expect(() => liqPayInstance.cnb_params(paramsWithInvalidAmount)).toThrow('amount must be a number or a string that can be converted to a number');
        });

        it('should throw an error if amount is missing', () => {
            const paramsWithoutAmount = {
                version: 3,
                action: 'pay',
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345'
            };

            expect(() => liqPayInstance.cnb_params(paramsWithoutAmount)).toThrow('amount is null');
        });

    });

    describe('str_to_sign function', () => {

        let liqPayInstance;

        beforeEach(() => {
            liqPayInstance = new LiqPay('public key', 'Private key'); // Assuming you have a constructor in your LiqPay class
        });

        it('should return a base64 encoded SHA-1 hash of the input string', () => {
            const input = "test";
            const output = liqPayInstance.str_to_sign(input);
            const expectedOutput = crypto.createHash('sha1').update(input).digest('base64');

            expect(output).toBe(expectedOutput);
        });

        it('should throw an error if the input is not a string', () => {
            const input = 12345; // a number, not a string
            expect(() => liqPayInstance.str_to_sign(input)).toThrow('Input must be a string');
        });

        it('should throw an error if the input is null', () => {
            const input = null;
            expect(() => liqPayInstance.str_to_sign(input)).toThrow('Input must be a string');
        });

        it('should throw an error if the input is undefined', () => {
            const input = undefined;
            expect(() => liqPayInstance.str_to_sign(input)).toThrow('Input must be a string');
        });
    });

    describe('cnb_object function', () => {


        it('should return an object with data and signature properties', () => {
            const params = {
                version: 3,
                action: 'pay',
                amount: 100.5,
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345',
                language: 'en'
            };
            const result = liqPayInstance.cnb_object(params);

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('signature');
        });

        // Add more tests as needed
    });

    describe('cnb_signature function', () => {
        it('should return a valid signature for given params', () => {
            const params = {
                version: 3,
                action: 'pay',
                amount: 100.5,
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345'
            };

            const signature = liqPayInstance.cnb_signature(params);

            // Here, we're replicating the signature generation process to validate the result
            const data = Buffer.from(JSON.stringify(liqPayInstance.cnb_params(params))).toString('base64');
            const expectedSignature = liqPayInstance.str_to_sign('Private key' + data + 'Private key'); // Replace 'private key' with the actual private key if it's different

            expect(signature).toBe(expectedSignature);
        });

        it('should throw an error if a required parameter is missing', () => {
            const params = {
                version: 3,
                action: 'pay',
                amount: 100.5,
                currency: 'USD',
                // description is missing
                order_id: 'order12345'
            };

            expect(() => liqPayInstance.cnb_signature(params)).toThrow('description is null or not provided');
        });
    });

    describe('api function', () => {
        it('should return data when the request is successful', async () => {
            const mockData = { success: true };
            axios.post.mockResolvedValue({ status: 200, data: mockData });

            const params = {
                version: 3,
                action: 'pay',
                amount: 100.5,
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345'
            };

            const result = await liqPayInstance.api('/test-path', params);
            expect(result).toEqual(mockData);
        });

        it('should throw an error when the request fails', async () => {
            axios.post.mockResolvedValue({ status: 400 });

            const params = {
                version: 3,
                action: 'pay',
                amount: 100.5,
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345'
            };

            await expect(liqPayInstance.api('/test-path', params)).rejects.toThrow('Request failed with status code: 400');
        });

        it('should throw an error if version is missing', async () => {
            const paramsWithoutVersion = {
                action: 'pay',
                amount: 100.5,
                currency: 'USD',
                description: 'Test payment',
                order_id: 'order12345'
            };

            await expect(liqPayInstance.api('/test-path', paramsWithoutVersion)).rejects.toThrow('version is null');
        });
    });

});
