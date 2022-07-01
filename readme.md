# Generate Spring Code and save yourself saving time

## How to run:
### Clone this repository
> git clone git@github.com:mutisyap/springcodegen.git

### Change to the directory
> cd springcodegen
  
### Install packages (ejs, fs-extra and yargs-parser)
> npm install

### Optional: Create entity JSON file. e.g /home/user/objects/user.json
```json
[
    {
        "field": "name",
        "type": "Integer",
        "dbType": "int(4)"
    },
    {
        "field": "createdOn",
        "type": "String",
        "dbType": "varchar(35)"
    },
    {
        "field": "createdBy",
        "type": "String",
        "dbType": "varchar(35)"
    },
    {
        "field": "lastUpdatedOn",
        "type": "String",
        "dbType": "varchar(35)"
    },
    {
        "field": "lastUpdatedBy",
        "type": "String",
        "dbType": "varchar(35)"
    }
]
```

### Generate a sample empty
> node springgen package entity absoluteFilName(optional)

### e.g
> node springgen io.mutisyap.sample SampleEntity /home/user/objects/user.json


## What you will get:

```java
/ **Domain:
* --------------------
**/
package io.mutisyap.sample.domain;

import lombok.Data;
import javax.persistence.*;
import java.io.Serializable;

@Entity
@Data
@Table(name = "tbl_sample_entitys")
public class SampleEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String createdOn;

    private String createdBy;

    private String lastUpdatedOn;

    private String lastUpdatedBy;

}


/**Repo
* --------------------:
*/
package io.mutisyap.sample.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import io.mutisyap.sample.domain.SampleEntity;

/**
 * Spring Data SQL repository for the Notification entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SampleEntityRepository extends JpaRepository<SampleEntity, Long> {}
```

```xml
<!-- Liquibase Changelog: -->
<!-- -------------------- -->

<?xml version="1.0" encoding="utf-8"?>
<databaseChangeLog
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.3.xsd">

    <!--
        Added the entity OneTimePin.
    -->
    <changeSet id="20220404073034" author="user">
        <createTable tableName="tbl_sample_entitys">
            <column name="id" type="bigint" autoIncrement="true">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <!-- Add your other fields here -->

            <column name="created_on" type="varchar(25)">
                <constraints nullable="true"/>
            </column>
            <column name="created_by" type="varchar(25)">
                <constraints nullable="true"/>
            </column>
            <column name="last_updated_on" type="varchar(25)">
                <constraints nullable="true"/>
            </column>
            <column name="last_updated_by" type="varchar(25)">
                <constraints nullable="true"/>
            </column>
        </createTable>
    </changeSet>
</databaseChangeLog>
```

```java

/**Service:
* --------------------
*/

package io.mutisyap.sample.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.mutisyap.sample.domain.SampleEntity;
import io.mutisyap.sample.repository.SampleEntityRepository;

import java.util.List;
import java.util.Optional;

/**
 * Service Implementation for managing {@link SampleEntity}.
 */
@Service
@Transactional
public class SampleEntityService {

    private final Logger log = LoggerFactory.getLogger(SampleEntityService.class);

    private final SampleEntityRepository sampleEntityRepository;


    public SampleEntityService(SampleEntityRepository sampleEntityRepository) {
        this.sampleEntityRepository = sampleEntityRepository;
    }

    /**
     * Save a sampleEntity.
     *
     * @param sampleEntity the sampleEntity to save.
     * @return the persisted sampleEntity.
     */
    public SampleEntity save(SampleEntity sampleEntity) {
        log.debug("Request to save sampleEntity : {}", sampleEntity);
        return sampleEntityRepository.save(sampleEntity);
    }


    /**
     * Get all the sampleEntitys.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<SampleEntity> findAll() {
        log.debug("Request to get all sampleEntitys");
        return sampleEntityRepository.findAll();
    }

    /**
     * Get one sampleEntity by id.
     *
     * @param id the id of the sampleEntity.
     * @return the sampleEntity.
     */
    @Transactional(readOnly = true)
    public Optional<SampleEntity> findOne(Long id) {
        log.debug("Request to get sampleEntity : {}", id);
        return sampleEntityRepository.findById(id);
    }

    /**
     * Delete the sampleEntity by id.
     *
     * @param id the id of the sampleEntity.
     */
    public void delete(Long id) {
        log.debug("Request to delete sampleEntity : {}", id);
        sampleEntityRepository.deleteById(id);
    }
}



/** Controller:
* --------------------
*/
package io.mutisyap.sample.web.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.mutisyap.sample.domain.SampleEntity;
import io.mutisyap.sample.service.SampleEntityService;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing {@link io.mutisyap.sample.domain.SampleEntity}.
 */
@RestController
@RequestMapping("/api")
public class SampleEntityResource {

    private final Logger log = LoggerFactory.getLogger(SampleEntityResource.class);
     
    private final SampleEntityService sampleEntityService;

    public SampleEntityResource(SampleEntityService sampleEntityService) {
        this.sampleEntityService = sampleEntityService;
    }

    @PostMapping("/sample_entitys")
    public ResponseEntity<SampleEntity> createSampleEntity(@Valid @RequestBody SampleEntity sampleEntity)
            throws URISyntaxException {
        log.debug("REST request to save sampleEntity : {}", sampleEntity);

        SampleEntity result = sampleEntityService.save(sampleEntity);
        return ResponseEntity
                .created(new URI("/api/sample_entitys/" + result.getId()))
                .body(result);
    }

    @PutMapping("/sample_entitys/{id}")
    public ResponseEntity<SampleEntity> updateSampleEntity(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody SampleEntity sampleEntity
    ) throws URISyntaxException {
        log.debug("REST request to update sampleEntity : {}, {}", id, sampleEntity);

        SampleEntity result = sampleEntityService.save(sampleEntity);
        return ResponseEntity
                .ok()
                .body(result);
    }

    /**
     * {@code GET  /sample_entitys} : get all the sampleEntity.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of sampleEntity in body.
     */
    @GetMapping("/sample_entitys")
    public List<SampleEntity> getAllSampleEntitys() {
        log.debug("REST request to get all SampleEntitys");
        return sampleEntityService.findAll();
    }

    /**
     * {@code GET  /sample_entitys/:id} : get the "id" sampleEntity.
     *
     * @param id the id of the sampleEntity to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the sampleEntity, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/sample_entitys/{id}")
    public ResponseEntity<SampleEntity> getSampleEntity(@PathVariable Long id) {
        log.debug("REST request to get sampleEntity : {}", id);
        Optional<SampleEntity> sampleEntityOptional = sampleEntityService.findOne(id);
        return sampleEntityOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * {@code DELETE  /sample_entitys/:id} : delete the "id" sampleEntity.
     *
     * @param id the id of the sampleEntity to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/sample_entitys/{id}")
    public ResponseEntity<Void> deleteSampleEntity(@PathVariable Long id) {
        log.debug("REST request to delete sampleEntity : {}", id);
        sampleEntityService.delete(id);
        return ResponseEntity
                .noContent()
                .build();
    }
}
```

You can now copy and paste these into your IntelliJ or create class files and xml then paste the contents.

## Writing directly to files Coming soon!!!
