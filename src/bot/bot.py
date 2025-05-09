import asyncio
from telegram import Bot
import logging
from datetime import datetime
from decouple import config

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

TOKEN = config("BOT_TOKEN")
CHAT_ID = config("CHAT_ID")

order_messages = {}


async def send_telegram_message(bot, chat_id, message, order_id):
    try:
        if order_id in order_messages:
            await bot.edit_message_text(
                chat_id=chat_id,
                message_id=order_messages[order_id],
                text=message,
                parse_mode='HTML'
            )
        else:
            sent_message = await bot.send_message(
                chat_id=chat_id,
                text=message,
                parse_mode='HTML'
            )
            order_messages[order_id] = sent_message.message_id
    except Exception as e:
        logger.error(f"Error with message: {e}")


def send_order_notification(order_details):
    try:
        items_list = "\n".join([
            f"<pre>• {item['title']} ({item['volume'] if item['volume'] else '-'}) - {item['quantity']} шт. x {item['price']} грн = {item['total']} грн</pre>"
            for item in order_details['items']
        ])

        payment_status = '✅ Оплачено' if order_details['paid_status'] else '⏳ Ожидает оплаты'

        header = '📝 Заказ оплачен!\n🔄 Статус оплаты обновлен!' if order_details['paid_status'] else '🆕 Новый заказ!'

        message = f"""{header}
━━━━━━━━━━━━━━━━━━━━━
🔎 <b>Заказ:</b> #{order_details['oid']}

👤 <b>Информация о клиенте:</b>
├ <b>Имя:</b> {order_details['fname']} {order_details['lname']}
├ <b>Email:</b> {order_details['email']}
└ <b>Телефон:</b> {order_details['phone']}

📍 <b>Адрес доставки:</b>
├ <b>Область:</b> {order_details['state']}
├ <b>Город:</b> {order_details['city']}
└ <b>Отделение:</b> {order_details['address']}

🛍 <b>Заказанные товары:</b>
{items_list}
━━━━━━━━━━━━━━━━━━━━━
💰 <b>Итоговая сумма:</b> {order_details['price']} грн
💳 <b>Статус оплаты:</b> {payment_status}

⏰ <b>Дата:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"""

        bot = Bot(token=TOKEN)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        loop.run_until_complete(send_telegram_message(bot, CHAT_ID, message, order_details['oid']))
        loop.close()

    except Exception as e:
        logger.error(f"Error sending notification: {e}")