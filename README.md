# kibanaSearchLogger

Плагин для сбора ui метрик Kibana

---

## Разработка

См. [руководство по разработке Kibana](https://github.com/elastic/kibana/blob/main/CONTRIBUTING.md) для настройки среды разработки.

## Скрипты

<dl>
  <dt><code>yarn kbn bootstrap</code></dt>
  <dd>Устанавливает зависимости (node_modules) и настраивает их в плагине и в Kibana</dd>

  <dt><code>yarn plugin-helpers build</code></dt>
  <dd>Создаёт дистрибутивную версию плагина для установки в Kibana</dd>
</dl>

## Установка и запуск

Для запуска плагина:  

- **Клонируйте репозиторий Kibana**  
- **Скопируйте файлы плагина** в папку `plugins`  
- **Установите зависимости**:  
  ```sh
  yarn kbn bootstrap
- **Запустить** снапшот кибаны конкретной версии можно командой `yarn es snapshot --license trial --version <version>`
- **Авторизуйтесь**: логин `elastic` пароль `changeme`
- **Сбилдить** плагин можно командой `yarn build` с указанием версии
