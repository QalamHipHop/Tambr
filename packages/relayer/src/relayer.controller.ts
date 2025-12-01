import { Controller, Post, Body, Logger } from '@nestjs/common';
import { RelayerService } from './relayer.service';

@Controller('relayer')
export class RelayerController {
  private readonly logger = new Logger(RelayerController.name);

  constructor(private readonly relayerService: RelayerService) {}

  /**
   * POST /relayer/relay
   * Receives a signed meta-transaction and relays it to the blockchain.
   * Body: { request: EIP712Request, signature: string }
   */
  @Post('relay')
  async relayTransaction(@Body() body: { request: any; signature: string }) {
    try {
      const txHash = await this.relayerService.relayTransaction(
        body.request,
        body.signature,
      );
      return {
        success: true,
        txHash,
        message: 'Transaction successfully relayed.',
      };
    } catch (error) {
      this.logger.error('Relay failed:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Transaction relay failed.',
      };
    }
  }
}
