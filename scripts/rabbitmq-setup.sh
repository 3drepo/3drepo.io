export queue_username=user
export queue_password=some_secure_password

export queue_bouncer_username=bouncer
export queue_bouncer_password=some_secure_password


sudo rabbitmqctl add_user $queue_username $queue_password
sudo rabbitmqctl add_user $queue_bouncer_username $queue_bouncer_password

export queue_jobq_name=jobq
export queue_callbackq_name=callbackq 
export queue_chat_name=eventExchange

sudo rabbitmqctl set_permissions $queue_username "$queue_jobq_name|amq.gen|$queue_callbackq_name|$queue_chat_name" "$queue_jobq_name|amq.gen|amq.default|$queue_chat_name" "amq.gen|$queue_callbackq_name|amq.default|$queue_chat_name"
sudo rabbitmqctl set_permissions $queue_bouncer_username "$queue_jobq_name|$queue_callbackq_name" "$queue_callbackq_name|amq.default" "$queue_jobq_name|$queue_callbackq_name"