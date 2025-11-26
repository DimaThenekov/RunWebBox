# Loader

Файлы в этой дериктории отвечают за импорт и экспорт проекта. Основная работа с проектом происходит с WebBoxConfig. Это json-файл содежающий файловую систему, информацию о машинах и их подключениях.
Под машинами подразумевается сетевое оборудование обрабатывающее запросы (в том числе внутренний браузер)

Вот диаграмма импорта:

```mermaid
flowchart LR
    A[App] --> B["loader(url)"]

    B --> C["github(url.github)"]
    B --> D["json(url.webbox_url)"]
    B --> E["direct(url.data)"]

    subgraph F ["FileItem (Files)"]
        FA[name: string]
        FC["content | FileItem[]"]
    end

    C --> F
    D --> F
    E --> F

    F --> G["applyDiff(fileItem, url.diff)"]
    F --> H
    G --> H["exportWebBoxConfig(fileItem)"]

    H --> I[WebBoxConfig]

    subgraph I [WebBoxConfig]
        J[version]
        K[fileItem]
        L[config]
    end
```
