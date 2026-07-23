import { useState, type FC } from 'react';

import { SendOutlined } from '@ant-design/icons';
import { Input, Select, Button, Form, Card, Flex } from 'antd';

import './BroadcastForm.css';
import {
  NOTIFICATION_TYPE_OPTIONS,
  type ConnectionStatus,
  type NotificationType,
  type ProtocolMode,
} from '@packages/types';

interface BroadcastFormProps {
  mode: ProtocolMode;
  status: ConnectionStatus;
  onSend: (message: string, type: NotificationType) => void;
}

export const BroadcastForm: FC<BroadcastFormProps> = ({ mode, status, onSend }) => {
  const [customMsg, setCustomMsg] = useState('');
  const [customType, setCustomType] = useState<NotificationType>('info');

  const isDisabled = mode !== 'websockets' || status !== 'connected';

  const handleSubmit = () => {
    if (!customMsg.trim() || isDisabled) return;

    onSend(customMsg, customType);
    setCustomMsg('');
  };

  return (
    <Card size="small" className="broadcast-panel-card">
      <h3 className="broadcast-title">Отправить событие</h3>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Текст уведомления" className="broadcast-form-text-input-label">
          <Input
            placeholder="Введите текст события..."
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            disabled={isDisabled}
          />
        </Form.Item>

        <Flex gap="8px" align="flex-end">
          <Form.Item label="Тип важности" className="broadcast-form-type-select-label">
            <Select
              value={customType}
              onChange={(value) => setCustomType(value)}
              disabled={isDisabled}
              options={NOTIFICATION_TYPE_OPTIONS}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            disabled={isDisabled || !customMsg.trim()}
          >
            Отправить
          </Button>
        </Flex>
      </Form>
    </Card>
  );
};
