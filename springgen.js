const fs = require('fs-extra');
const ejs = require('ejs');
const argv = require('yargs-parser')(process.argv.slice(2));
const path = require('path');



const main = () => {
    console.log('Current Dir : ', __dirname);

    // extract values
    const package = argv._[0];
    const entity = argv._[1];
    const entity_json_path = argv._[2];
    const use_dto = argv._[3];
    const use_lombok = argv._[4];
    let base_dir = argv._[5];

    if (!package || !entity) {
        console.error('package and entity are required. e.g tech.meliora.test EntityName');
        process.exit();
    }

    const objectName = entity.charAt(0).toLowerCase() + entity.slice(1);
    const entityAPI = objectName.replace(/([A-Z])/g, '_$1').trim().toLowerCase();
    const dateNow = new Date();
    let dateFormat = {
        year: "numeric", month: "2-digit",
        day: "2-digit", hour: "2-digit", minute: "2-digit",
        second: "2-digit"
    };
    const changeLogId = `${dateNow.getFullYear()}${('0' + (dateNow.getMonth() + 1)).slice(-2)}${('0' + dateNow.getDate()).slice(-2)}${('0' + dateNow.getHours()).slice(-2)}${('0' + dateNow.getMinutes()).slice(-2)}${('0' + dateNow.getSeconds()).slice(-2)}`

    // const changeLogId = dateNow.toLocaleTimeString('en-us', dateFormat);

    var objectFields;
    console.log('entity_json_path : ', entity_json_path);

    if (entity_json_path) {
        objectFields = JSON.parse(fs.readFileSync(entity_json_path));
    }

    objectFields = setFieldColumns(objectFields);


    console.log('objectFields : ', objectFields);
    let useDTO = false;
    let useLombok = true;

    if (use_dto && (use_dto === 1 || use_dto.toLowerCase() === 'true')) {
        useDTO = true;
    }

    if (use_lombok && (use_lombok === 1 || use_lombok.toLowerCase() === 'true')) {
        useLombok = true;
    } else {
        useLombok = false;
    }

    let writeToFile = false;

    if (base_dir && base_dir.length) {
        writeToFile = true;
    }


    const data = {
        package,
        entity,
        objectName,
        entityAPI,
        changeLogId,
        objectFields,
        useDTO,
        useLombok,
        writeToFile,
        base_dir
    };

    const options = {};

    console.log('data : ', data);

    // render domain
    console.log('\n\nDomain:\n--------------------');
    data.objectType = 'domain';
    const domainTemplateFilename = path.join(__dirname, "./templates/domain.java.ejs")
    render(domainTemplateFilename, data, options);

    if (useDTO) {
        // render dto
        console.log('\n\DTO:\n--------------------');
        data.objectType = 'dto';
        const dtoTemplateFilename = path.join(__dirname, "./templates/dto.java.ejs")
        render(dtoTemplateFilename, data, options);

        // render mapper generic
        console.log('\n\Generic Mapper - If not present:\n--------------------');
        data.objectType = 'generic-mapper';
        const mapperTemplateFilename = path.join(__dirname, "./templates/mapper.java.ejs")
        render(mapperTemplateFilename, data, options);

        // render entity mapper
        console.log('\n\Entity Mapper - If not present:\n--------------------');
        data.objectType = 'mapper';
        const entityMapperTemplateFilename = path.join(__dirname, "./templates/entity.mapper.java.ejs")
        render(entityMapperTemplateFilename, data, options);
    }

    // render repo
    console.log('\n\nRepo\n--------------------:');
    data.objectType = 'repository';
    const repoTemplateFilename = path.join(__dirname, "./templates/jparepo.java.ejs")
    render(repoTemplateFilename, data, options);

    // render liquibase
    console.log('\n\Liquibase Changelog:\n--------------------');
    data.objectType = 'liquibase';
    const liquibaseTemplateFilename = path.join(__dirname, "./templates/liquibase.xml.ejs")
    render(liquibaseTemplateFilename, data, options);

    // render service
    console.log('\n\nService:\n--------------------');
    data.objectType = 'service';
    const serviceTemplateFilename = path.join(__dirname, "./templates/service.java.ejs")
    render(serviceTemplateFilename, data, options);

    // render controller
    console.log('\n\nController:\n--------------------');
    data.objectType = 'controller';
    const controllerTemplateFilename = path.join(__dirname, "./templates/controller.java.ejs");
    render(controllerTemplateFilename, data, options);

}


function render(templateFilename, data, options) {
    ejs.renderFile(templateFilename, data, options, function (err, str) {
        if (err) {
            console.error(err);
        }

        if (data.writeToFile) {
            let filename = data.base_dir + getDestinationFolder(data.objectType, data.entity, data.package.replaceAll('.', "/"), data.entityAPI);

            console.log('Filename : ', filename);

            fs.writeFile(filename, str, err => {
                if (err) {
                  console.error(err);
                }
                // file written successfully
              });

        } else {
            console.log(str);
        }


    });
}

function getDestinationFolder(objectType, entity, packageFolders, entityAPI) {
    switch (objectType) {
        case 'controller':
            return '/src/main/java/' + packageFolders + '/web/rest/' + entity + 'Resource.java';
        case 'domain':
            return '/src/main/java/' + packageFolders + '/domain/' + entity + '.java';
        case 'dto':
            return '/src/main/java/' + packageFolders + '/service/dto/' + entity + 'DTO.java';
        case 'mapper':
            return '/src/main/java/' + packageFolders + '/service/mapper/' + entity + 'Mapper.java';
        case 'repository':
            return '/src/main/java/' + packageFolders + '/repository/' + entity + 'Repository.java';
        case 'liquibase':
            return '/src/main/resources/config/liquibase/' + entityAPI + '-liquibase.xml';
        case 'generic-mapper':
            return '/src/main/java/' + packageFolders + '/service/mapper/EntityMapper.java';

        case 'service':
            return '/src/main/java/' + packageFolders + '/service/' + entity + 'Service.java';
        default:
            return '/src/main/java/' + packageFolders +'/test';
    }
}


function setFieldColumns(objectFields) {
    objectFields.forEach(objectField => {
        objectField.column = objectField.field.replace(/([A-Z])/g, '_$1').trim().toLowerCase();
        objectField.capitalized = objectField.field.charAt(0).toUpperCase() + objectField.field.slice(1);
    });

    return objectFields;
}

main();